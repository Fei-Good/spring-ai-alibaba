///
/// Copyright 2024-2025 the original author or authors.
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///      https://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import { TelemetryResult } from './chat_model';

export interface GraphData {
  id: string;
  name: string;
  description?: string;
  nodes?: GraphNode[];
  edges?: GraphEdge[];
  // Add other relevant fields as needed
}

export interface GraphNode {
  id: string;
  type: string;
  data: Record<string, any>;
  position: {
    x: number;
    y: number;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface GraphRunActionParam {
  graphName: string;
  input: Record<string, any>;
  stream?: boolean;
  // Add other relevant fields as needed
}

export interface GraphRunResult {
  id: string;
  status: string;
  result: any;
  telemetry: TelemetryResult;
  // Add other relevant fields as needed
}

export interface GraphOptions {
  // Graph-specific configuration options
  maxExecutionTime?: number;
  enableParallelExecution?: boolean;
  debugMode?: boolean;//后续需要更改为
  // Add other configuration options as needed
}

export interface GraphStudioConfig {
  graphOptions: GraphOptions;
  // Add other studio-specific configurations
}
