---
name: aws-cost-check
description: Discovery-driven AWS account cost audit — finds active resources, attributes spend, and flags runaway costs, errors, and anomalies
disable-model-invocation: true
---

# AWS Cost Check

Audit the cost and health of an AWS account. Discover what's actually running, attribute Cost
Explorer spend to it, and flag anomalies (runaway loops, error storms, DLQ buildup, throttling,
idle expensive resources, cost spikes).

This is a **generic, discovery-driven** audit — it inspects whatever is in the account and makes
no assumptions about application architecture.

## Input

`<args>` may contain:

- **Profile** (optional): an AWS profile name. If omitted, check the repo's AGENTS.md / CLAUDE.md
  for an `## AWS Cost Check` section with a default profile; else fall back to the AWS CLI default.
- **Window** (optional): `24h`, `7d`, `mtd` (default `mtd` = month-to-date).

Examples: `/aws-cost-check` · `/aws-cost-check 24h` · `/aws-cost-check my-profile 7d`

## Prerequisites

- `aws` CLI installed and the profile authenticated.
- Profile needs read on Cost Explorer + CloudWatch and list access to the relevant services
  (Lambda, DynamoDB, SQS, S3, EC2, etc.). Route 53, API Gateway domains, Budgets, and KMS metadata
  improve attribution — if any call is **denied, report the exact action** in Attribution Gaps
  rather than silently skipping.
- **Scope:** Cost Explorer is global and may span linked accounts + regions; resource enumeration
  is per-account/per-region. Identify these boundaries in the final attribution section.
- **Repo config:** repos can set a default payer profile, auth command (e.g. SSO login), and
  linked-account read-only profiles in an `## AWS Cost Check` section. Check it before defaulting.
- **bkonkle-dev/apps note:** the `billing-admin` SSO inline policy grants discovery via statement
  `AwsCostCheckResourceDiscoveryReadOnly` (`infra/management/sso_billing.tf`). After Terraform
  changes there, the user must start a **new** SSO session before retesting — Identity Center does
  not refresh in-flight credentials.
- **Sandbox note (Cursor/Codex):** AWS CLI cache writes (`~/.aws/sso/cache`, `~/.aws/cli/cache`)
  may fail with `Operation not permitted`; rerun outside the sandbox / with elevated permissions
  and document the adjustment.

## Steps

### 1. Authenticate

Resolve the profile (args → repo config → default), then verify:

```sh
aws sts get-caller-identity --profile <profile>
```

On a credentials error: for SSO run `aws sso login --profile <profile>` and retry after the user
completes the browser login; for static creds, ask how they'd like to authenticate. Print the
account ID, role, and default region so the user knows what's being audited.

### 2. Cost Explorer — attribute the spend

Get the by-service breakdown for the window and present a table (service, cost, % of total),
sorted descending:

```sh
aws ce get-cost-and-usage --profile <profile> \
  --time-period Start=<start>,End=<end> --granularity MONTHLY \
  --metrics UnblendedCost --group-by Type=DIMENSION,Key=SERVICE --output json
```

Then fetch the **daily trend** and flag any day **> 2x the average** of the rest:

```sh
aws ce get-cost-and-usage --profile <profile> \
  --time-period Start=<start>,End=<end> --granularity DAILY \
  --metrics UnblendedCost --output json
```

Also pull **LINKED_ACCOUNT** and **REGION** splits (same shape, swap the `--group-by Key`) so you
know where to enumerate. If a non-payer account drives spend, switch to a linked-account read-only
profile to enumerate there, or call out the attribution risk if unavailable.

When a top billed service doesn't match inventory, drill into it by **USAGE_TYPE** before
concluding — this usually explains deleted, global, or cross-region resources:

```sh
aws ce get-cost-and-usage --profile <profile> \
  --time-period Start=<start>,End=<end> --granularity MONTHLY --metrics UnblendedCost \
  --group-by Type=DIMENSION,Key=USAGE_TYPE \
  --filter '{"Dimensions":{"Key":"SERVICE","Values":["Amazon DynamoDB"]}}' --output json
```

### 3. Enumerate active resources

List what's running and pull CloudWatch metrics over the window. **Lead with services that have
meaningful spend** (e.g. > $0.01); skip services that return empty. Estimate cost from observed
usage, and reconcile against the Cost Explorer total — the billed number wins when they disagree.

#### 3a. Lambda

```sh
aws lambda list-functions --profile <profile> \
  --query 'Functions[].{Name:FunctionName,Runtime:Runtime,Memory:MemorySize,Timeout:Timeout}' \
  --output json
```

Per function, over the window: **Invocations** (Sum), **Errors** (Sum), **Duration** (Avg ms),
**Throttles** (Sum). Derive error rate (`Errors/Invocations`) and GB-seconds
(`Invocations * AvgDuration_sec * Memory_MB / 1024`). Flag high invocation counts with no clear
schedule, error rate > 20%, or any throttles.

#### 3b. DynamoDB

```sh
aws dynamodb list-tables --profile <profile> --output json
aws dynamodb describe-table --profile <profile> --table-name <table> \
  --query 'Table.{BillingMode:BillingModeSummary.BillingMode,ItemCount:ItemCount,TableSizeBytes:TableSizeBytes}'
```

Per table from CloudWatch: **ConsumedRead/WriteCapacityUnits** (Sum), **ThrottledRequests** (Sum),
**SystemErrors** (Sum). Cost: on-demand $1.25/1M WRU, $0.25/1M RRU; storage $0.25/GB-month. Flag
any throttled requests or system errors > 0.

#### 3c. S3

```sh
aws s3api list-buckets --profile <profile> --output json
aws cloudwatch get-metric-statistics --profile <profile> \
  --namespace AWS/S3 --metric-name BucketSizeBytes \
  --dimensions Name=BucketName,Value=<bucket> Name=StorageType,Value=StandardStorage \
  --start-time <2-days-ago> --end-time <now> --period 86400 --statistics Average
```

`BucketSizeBytes` lags and is often empty for new/low-activity buckets — don't infer zero cost from
empty datapoints. If Cost Explorer shows S3 spend but the metric is zero, check the bucket region
and other storage classes / usage types.

#### 3d. Bedrock

```sh
aws cloudwatch list-metrics --profile <profile> \
  --namespace AWS/Bedrock --metric-name Invocations --query 'Metrics[].Dimensions'
```

If metrics exist, per model collect **Invocations**, **Input/OutputTokenCount** (if available), and
**InvocationLatency** (Avg). Estimate cost from the **actual model IDs / Cost Explorer usage types
you observe** — do not assume a Claude-only price table (accounts may use Anthropic, Nova, or
inference profiles). If token counts are missing, approximate ~1K in / ~300 out per invocation and
mark it approximate. Bedrock has no free allowance and is often a top cost driver — surface it
prominently when invocations exist.

#### 3e. EC2 / ECS / RDS

```sh
aws ec2 describe-instances --profile <profile> \
  --filters "Name=instance-state-name,Values=running" \
  --query 'Reservations[].Instances[].{Id:InstanceId,Type:InstanceType,LaunchTime:LaunchTime}' --output json
aws ecs list-clusters --profile <profile> --output json
aws rds describe-db-instances --profile <profile> \
  --query 'DBInstances[].{Id:DBInstanceIdentifier,Class:DBInstanceClass,Status:DBInstanceStatus}' --output json 2>/dev/null
```

When **EC2 - Other** (EBS) or **VPC** (public IPv4) spend appears but running inventory is thin,
also list volumes and Elastic IPs — orphan volumes and unattached EIPs are common drivers:

```sh
aws ec2 describe-volumes --profile <profile> \
  --query 'Volumes[].{Id:VolumeId,State:State,Size:Size,Type:VolumeType,Attachments:Attachments}' --output json
aws ec2 describe-addresses --profile <profile> --output json
```

Flag any running instances, active ECS clusters, or RDS instances — typically the priciest
resources.

#### 3f. CloudWatch (logs, alarms, dashboards)

```sh
aws cloudwatch get-metric-statistics --profile <profile> \
  --namespace AWS/Logs --metric-name IncomingBytes \
  --start-time <start> --end-time <now> --period <window-seconds> --statistics Sum
aws cloudwatch describe-alarms --profile <profile> \
  --query '{Metric:MetricAlarms[].{Name:AlarmName,State:StateValue},Composite:CompositeAlarms[].{Name:AlarmName,State:StateValue}}' --output json
aws cloudwatch list-dashboards --profile <profile> --output json
```

Flag any alarm in **ALARM** state. If CloudWatch spend is material, pull Cost Explorer usage types
to separate logs ingestion from alarms, dashboards, and custom metrics, and flag log groups driving
high ingestion.

#### 3g. SQS (queues + DLQs)

```sh
aws sqs list-queues --profile <profile> --output json
aws sqs get-queue-attributes --profile <profile> --queue-url <url> \
  --attribute-names ApproximateNumberOfMessages ApproximateNumberOfMessagesNotVisible ApproximateNumberOfMessagesDelayed
```

Flag any queue with **> 0 messages** — especially DLQs (name contains `dlq` / `dead-letter`); a
growing DLQ is a health signal, not just cost.

#### 3h. Conditional probes (only when the service shows in Cost Explorer)

Run these one-off lookups to attribute spend in the long tail; skip any that aren't billed.

| If billed | Probe |
| --- | --- |
| Route 53 ($0.50/zone) | `aws route53 list-hosted-zones`; `list-health-checks`; `route53domains list-domains --region us-east-1` |
| API Gateway | `apigateway get-rest-apis`; `apigatewayv2 get-apis`; `get-domain-names` + `get-api-mappings` per domain |
| SNS | `sns list-topics`; CloudWatch `AWS/SNS NumberOfMessagesPublished` (Sum) per topic |
| EventBridge | `events list-rules` — check for rules firing at unexpectedly high frequency |
| KMS | `kms list-keys`; `kms list-aliases` — attribute via Cost Explorer usage types |
| Secrets Manager | `secretsmanager list-secrets` (metadata only, never values) |
| EFS | `efs describe-file-systems` |
| Budgets | `budgets describe-budgets --account-id <account-id>` — list names, units, limits |

`route53domains:ListDomains` is only offered from **`us-east-1`**; if denied, note the gap — it
weakens Route 53 attribution.

### 4. Anomaly detection

Flag anything unusual:

- **Runaway loops:** Lambda > 10,000 invocations/day with no schedule-based reason.
- **Error storms:** any resource with > 20% error rate.
- **DLQ buildup:** any DLQ with a growing message count.
- **Throttling:** any DynamoDB or Lambda throttles.
- **Idle expensive resources:** running EC2/RDS/ECS with near-zero utilization.
- **Cost spikes:** any day > 2x the window average.
- **Alarms firing:** any CloudWatch alarm in ALARM state.
- **Spend without inventory:** a service has meaningful cost but inventory is empty/near-empty —
  usually deleted-in-window, linked-account, global, cross-region resources, or missing permissions.

### 5. Print summary

1. **Account Info** — account ID, profile, time window.
2. **Cost Overview** — total spend, daily average, projected monthly total.
3. **Cost by Service** — table sorted by cost descending.
4. **Daily Trend** — flag spikes.
5. **Resource Details** — per-service tables, only for services with active resources.
6. **Alerts** — ordered by severity:
   - 🔴 Critical: runaway costs, ALARM state, throttling.
   - 🟡 Warning: error rates > 10%, DLQ buildup, idle expensive resources.
   - 🟢 OK: within normal parameters.
7. **Attribution Gaps** — always include permission-denied APIs (verbatim action names),
   linked-account blind spots (cost in an account you couldn't enumerate), and region blind spots
   (non-default regions billed but not enumerated).
