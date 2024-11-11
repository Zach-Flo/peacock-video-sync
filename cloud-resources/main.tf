provider "aws" {
  region = "us-east-1"  
}

######################################################
# CREATE LAMBDAS
######################################################
data "archive_file" "connect_lambda_zip" {
  type        = "zip"
  source_dir  = "./connect-function"  
  output_path = "./connect-function.zip"
}

data "archive_file" "disconnect_lambda_zip" {
  type        = "zip"
  source_dir  = "./disconnect-function"  
  output_path = "./disconnect-function.zip" 
}

data "archive_file" "play_pause_lambda_zip" {
  type        = "zip"
  source_dir  = "./play-pause-function"  
  output_path = "./play-pause-function.zip" 
}

resource "aws_lambda_function" "connect_lambda" {
  function_name = "ConnectFunction"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  role = aws_iam_role.lambda_exec_role.arn
  filename = "connect-function.zip" 
}

resource "aws_lambda_function" "disconnect_lambda" {
  function_name = "DisconnectFunction"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  role = aws_iam_role.lambda_exec_role.arn
  filename = "disconnect-function.zip"
}

resource "aws_lambda_function" "play_pause_lambda" {
  function_name = "PlayPauseFunction"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  role = aws_iam_role.lambda_exec_role.arn
  filename = "play-pause-function.zip" 
}
######################################################
# END CREATE LAMBDAS
######################################################

######################################################
# CREATE API
######################################################
resource "aws_apigatewayv2_api" "websocket_api" {
  name          = "PeacockVideoSyncAPI"
  protocol_type = "WEBSOCKET"
  route_selection_expression = "$request.body.action"
}

# CREATE ROUTES
resource "aws_apigatewayv2_route" "connect_route" {
  api_id    = aws_apigatewayv2_api.websocket_api.id
  route_key = "$connect"
  target = "integrations/${aws_apigatewayv2_integration.connect_integration.id}"
}

resource "aws_apigatewayv2_route" "disconnect_route" {
  api_id    = aws_apigatewayv2_api.websocket_api.id
  route_key = "$disconnect"
  target = "integrations/${aws_apigatewayv2_integration.disconnect_integration.id}"
}

resource "aws_apigatewayv2_route" "play_pause_route" {
  api_id    = aws_apigatewayv2_api.websocket_api.id
  route_key = "play-pause"
  target = "integrations/${aws_apigatewayv2_integration.play_pause_integration.id}"
}
######################################################
# END CREATE ROUTES
######################################################

######################################################
# START CREATE INTEGRATION
######################################################
resource "aws_apigatewayv2_integration" "connect_integration" {
  api_id           = aws_apigatewayv2_api.websocket_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.connect_lambda.invoke_arn
}

resource "aws_apigatewayv2_integration" "disconnect_integration" {
  api_id           = aws_apigatewayv2_api.websocket_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.disconnect_lambda.invoke_arn
}

resource "aws_apigatewayv2_integration" "play_pause_integration" {
  api_id           = aws_apigatewayv2_api.websocket_api.id
  integration_type = "AWS_PROXY"
  integration_uri  = aws_lambda_function.play_pause_lambda.invoke_arn
}
######################################################
# END CREATE INTEGRATION
######################################################

######################################################
# START ROLES AND POLICY
######################################################
resource "aws_iam_role" "lambda_exec_role" {
  name = "lambda_exec_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action = "sts:AssumeRole",
        Effect = "Allow",
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_policy" "dynamodb_full_access_policy" {
  name        = "DynamoDBFullAccessPolicy"
  description = "Policy to grant full access to DynamoDB"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action   = "dynamodb:*",
        Effect   = "Allow",
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_policy" "api_gateway_manage_connections_policy" {
  name        = "ApiGatewayManageConnectionsPolicy"
  description = "Policy to manage WebSocket connections in API Gateway"
  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Action   = "execute-api:ManageConnections",
        Effect   = "Allow",
        Resource = "${aws_apigatewayv2_api.websocket_api.execution_arn}/*/*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "dynamodb_full_access_attachment" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.dynamodb_full_access_policy.arn
}

resource "aws_iam_role_policy_attachment" "lambda_execution_policy" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "api_gateway_manage_connections_attachment" {
  role       = aws_iam_role.lambda_exec_role.name
  policy_arn = aws_iam_policy.api_gateway_manage_connections_policy.arn
}

# Grant API Gateway permission to invoke Lambda functions
resource "aws_lambda_permission" "connect_lambda_permission" {
  statement_id  = "AllowExecutionFromApiGatewayConnect"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.connect_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.websocket_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "disconnect_lambda_permission" {
  statement_id  = "AllowExecutionFromApiGatewayDisconnect"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.disconnect_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.websocket_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "play_pause_lambda_permission" {
  statement_id  = "AllowExecutionFromApiGatewayPlay"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.play_pause_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.websocket_api.execution_arn}/*/*"
}
######################################################
# END ROLES AND POLICY
######################################################

######################################################
# START DYNAMO 
######################################################
resource "aws_dynamodb_table" "connection_ids" {
  name           = "manage-peacock-connections"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "connectionId"
  attribute {
    name = "connectionId"
    type = "S"
  }
}
######################################################
# END DYNAMO 
######################################################

resource "aws_apigatewayv2_deployment" "websocket_deployment" {
  api_id = aws_apigatewayv2_api.websocket_api.id
  depends_on = [
    aws_apigatewayv2_route.connect_route,
    aws_apigatewayv2_route.disconnect_route,
    aws_apigatewayv2_route.play_pause_route,
  ]
}

resource "aws_apigatewayv2_stage" "websocket_stage" {
  api_id      = aws_apigatewayv2_api.websocket_api.id
  name        = "dev"
  auto_deploy = true
}

output "websocket_api_id" {
  value = aws_apigatewayv2_api.websocket_api.id
}

output "stage_url" {
  value = "${aws_apigatewayv2_api.websocket_api.api_endpoint}/${aws_apigatewayv2_stage.websocket_stage.name}"
}
