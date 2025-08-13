/*
 * Copyright 2024-2026 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { GraphData, GraphNode, GraphEdge, GraphRunResult, GraphRunActionParam, GraphOptions } from '@/types/graphs';
import { TelemetryResult } from '@/types/chat_model';

// 基本节点模拟数据
export const mockNodes: Array<{
  id: string;
  name: string;
  type: string;
  group: string;
  description?: string;
}> = [
  // 主流程节点
  { 
    id: '__start__', 
    name: '__start__', 
    type: 'start', 
    group: 'main',
    description: '流程开始节点'
  },
  { 
    id: 'coordinator', 
    name: 'coordinator', 
    type: 'coordinator', 
    group: 'main',
    description: '协调器节点，负责流程协调'
  },
  { 
    id: 'planner', 
    name: 'planner', 
    type: 'planner', 
    group: 'main',
    description: '规划器节点，负责任务规划'
  },
  { 
    id: 'human_feedback', 
    name: 'human_feedback', 
    type: 'human', 
    group: 'main',
    description: '人工反馈节点'
  },
  { 
    id: 'reporter', 
    name: 'reporter', 
    type: 'reporter', 
    group: 'main',
    description: '报告生成节点'
  },
  { 
    id: '__end__', 
    name: '__end__', 
    type: 'end', 
    group: 'main',
    description: '流程结束节点'
  },

  // 研究团队子图节点
  { 
    id: 'research_team', 
    name: 'research_team', 
    type: 'team', 
    group: 'research',
    description: '研究团队节点'
  },
  { 
    id: 'coder', 
    name: 'coder', 
    type: 'coder', 
    group: 'research',
    description: '编码器节点，负责代码生成'
  },

  // 研究员子图节点
  { 
    id: 'researcher_start', 
    name: '__start__', 
    type: 'start', 
    group: 'researcher',
    description: '研究员子流程开始节点'
  },
  { 
    id: 'agent', 
    name: 'agent', 
    type: 'agent', 
    group: 'researcher',
    description: '代理节点，执行具体任务'
  },
  { 
    id: 'tools', 
    name: 'tools', 
    type: 'tools', 
    group: 'researcher',
    description: '工具节点，提供各种工具支持'
  },
  { 
    id: 'researcher_end', 
    name: '__end__', 
    type: 'end', 
    group: 'researcher',
    description: '研究员子流程结束节点'
  },
];

// GraphNode模拟数据（符合ReactFlow格式）
export const mockGraphNodes: GraphNode[] = [
  // 主流程节点
  {
    id: '__start__',
    type: 'start',
    position: { x: 100, y: 100 },
    data: { 
      label: '__start__',
      description: '流程开始节点',
      group: 'main'
    }
  },
  {
    id: 'coordinator',
    type: 'coordinator',
    position: { x: 100, y: 200 },
    data: { 
      label: 'coordinator',
      description: '协调器节点，负责流程协调',
      group: 'main'
    }
  },
  {
    id: 'planner',
    type: 'planner',
    position: { x: 100, y: 300 },
    data: { 
      label: 'planner',
      description: '规划器节点，负责任务规划',
      group: 'main'
    }
  },
  {
    id: 'human_feedback',
    type: 'human',
    position: { x: 100, y: 400 },
    data: { 
      label: 'human_feedback',
      description: '人工反馈节点',
      group: 'main'
    }
  },
  {
    id: 'reporter',
    type: 'reporter',
    position: { x: 100, y: 500 },
    data: { 
      label: 'reporter',
      description: '报告生成节点',
      group: 'main'
    }
  },
  {
    id: '__end__',
    type: 'end',
    position: { x: 100, y: 600 },
    data: { 
      label: '__end__',
      description: '流程结束节点',
      group: 'main'
    }
  },

  // 研究团队节点
  {
    id: 'coder',
    type: 'coder',
    position: { x: 400, y: 200 },
    data: { 
      label: 'coder',
      description: '编码器节点，负责代码生成',
      group: 'research'
    }
  },
  {
    id: 'research_team',
    type: 'team',
    position: { x: 600, y: 250 },
    data: { 
      label: 'research_team',
      description: '研究团队节点',
      group: 'research'
    }
  },

  // 研究员子图节点（位置相对独立）
  {
    id: 'researcher_start',
    type: 'start',
    position: { x: 800, y: 150 },
    data: { 
      label: '__start__',
      description: '研究员子流程开始节点',
      group: 'researcher'
    }
  },
  {
    id: 'agent',
    type: 'agent',
    position: { x: 800, y: 250 },
    data: { 
      label: 'agent',
      description: '代理节点，执行具体任务',
      group: 'researcher'
    }
  },
  {
    id: 'tools',
    type: 'tools',
    position: { x: 800, y: 350 },
    data: { 
      label: 'tools',
      description: '工具节点，提供各种工具支持',
      group: 'researcher'
    }
  },
  {
    id: 'researcher_end',
    type: 'end',
    position: { x: 800, y: 450 },
    data: { 
      label: '__end__',
      description: '研究员子流程结束节点',
      group: 'researcher'
    }
  },
];

// GraphEdge模拟数据
export const mockGraphEdges: GraphEdge[] = [
  // 主流程边
  {
    id: 'e1',
    source: '__start__',
    target: 'coordinator'
  },
  {
    id: 'e2',
    source: 'coordinator',
    target: 'planner'
  },
  {
    id: 'e3',
    source: 'planner',
    target: 'human_feedback'
  },
  {
    id: 'e4',
    source: 'human_feedback',
    target: 'reporter'
  },
  {
    id: 'e5',
    source: 'reporter',
    target: '__end__'
  },

  // 研究团队连接
  {
    id: 'e6',
    source: 'coder',
    target: 'research_team'
  },
  {
    id: 'e7',
    source: 'research_team',
    target: 'coordinator'
  },
  {
    id: 'e8',
    source: 'research_team',
    target: 'planner'
  },
  {
    id: 'e9',
    source: 'planner',
    target: 'research_team'
  },

  // 研究员子图内部连接
  {
    id: 'e10',
    source: 'researcher_start',
    target: 'agent'
  },
  {
    id: 'e11',
    source: 'agent',
    target: 'tools'
  },
  {
    id: 'e12',
    source: 'tools',
    target: 'researcher_end'
  },
  {
    id: 'e13',
    source: 'agent',
    target: 'agent' // 自循环
  },

  // 人工反馈回到规划器
  {
    id: 'e14',
    source: 'human_feedback',
    target: 'planner'
  },

  // 研究团队到研究员子图的连接
  {
    id: 'e15',
    source: 'research_team',
    target: 'researcher_start'
  },
  {
    id: 'e16',
    source: 'researcher_end',
    target: 'research_team'
  },
];

// 完整的图数据模拟
export const mockGraphData: GraphData[] = [
  {
    id: 'research-workflow',
    name: '研究工作流',
    description: '包含协调器、规划器、研究团队和人工反馈的完整研究工作流程',
    nodes: mockGraphNodes,
    edges: mockGraphEdges
  },
  {
    id: 'simple-workflow',
    name: '简单工作流',
    description: '简化版的工作流程，仅包含基本节点',
    nodes: mockGraphNodes.filter(node => node.data.group === 'main'),
    edges: mockGraphEdges.filter(edge => 
      ['e1', 'e2', 'e3', 'e4', 'e5'].includes(edge.id)
    )
  },
  {
    id: 'researcher-subgraph',
    name: '研究员子图',
    description: '研究员执行任务的子图流程',
    nodes: mockGraphNodes.filter(node => node.data.group === 'researcher'),
    edges: mockGraphEdges.filter(edge => 
      ['e10', 'e11', 'e12', 'e13'].includes(edge.id)
    )
  }
];

// 模拟的遥测结果数据
export const mockTelemetryResult: TelemetryResult = {
  traceId: 'graph-trace-' + Math.random().toString(36).substr(2, 16),
  spans: [
    {
      traceId: 'graph-trace-001',
      spanId: 'span-001',
      operationName: 'graph.execute',
      startTime: Date.now() - 5000,
      duration: 3000,
      tags: {
        'graph.name': 'research-workflow',
        'graph.version': '1.0.0',
        'component': 'graph-executor'
      },
      logs: [
        {
          timestamp: Date.now() - 4000,
          fields: {
            event: 'graph.started',
            message: '图执行开始'
          }
        },
        {
          timestamp: Date.now() - 2000,
          fields: {
            event: 'graph.completed',
            message: '图执行完成'
          }
        }
      ]
    }
  ]
};

// GraphRunResult模拟数据
export const mockGraphRunResults: GraphRunResult[] = [
  {
    id: 'run-001',
    status: 'success',
    result: {
      output: {
        message: '研究工作流执行成功',
        data: {
          analysisResult: '完成了客户反馈的深度分析',
          recommendationsCount: 5,
          executionTime: '3.2秒'
        }
      },
      nodeResults: {
        '__start__': { status: 'completed', output: 'started' },
        'coordinator': { 
          status: 'completed', 
          output: '协调任务分配完成',
          metadata: { assignedTasks: 3 }
        },
        'planner': { 
          status: 'completed', 
          output: '生成了详细的执行计划',
          metadata: { planSteps: 8, estimatedTime: '10分钟' }
        },
        'human_feedback': { 
          status: 'completed', 
          output: '收到人工反馈：方向正确',
          metadata: { feedbackScore: 8.5 }
        },
        'reporter': { 
          status: 'completed', 
          output: '生成了完整的分析报告',
          metadata: { reportPages: 12 }
        },
        '__end__': { status: 'completed', output: 'finished' }
      }
    },
    telemetry: mockTelemetryResult
  },
  {
    id: 'run-002',
    status: 'error',
    result: {
      error: {
        message: '执行过程中出现错误',
        code: 'EXECUTION_FAILED',
        details: '在planner节点执行时超时'
      },
      nodeResults: {
        '__start__': { status: 'completed', output: 'started' },
        'coordinator': { 
          status: 'completed', 
          output: '协调任务分配完成'
        },
        'planner': { 
          status: 'error', 
          error: '执行超时',
          metadata: { timeoutAfter: '30秒' }
        }
      }
    },
    telemetry: {
      ...mockTelemetryResult,
      traceId: 'graph-trace-002'
    }
  },
  {
    id: 'run-003',
    status: 'running',
    result: {
      output: {
        message: '图正在执行中...',
        currentNode: 'agent',
        progress: 0.6
      },
      nodeResults: {
        '__start__': { status: 'completed', output: 'started' },
        'coordinator': { 
          status: 'completed', 
          output: '协调任务分配完成'
        },
        'planner': { 
          status: 'completed', 
          output: '生成了详细的执行计划'
        },
        'research_team': { 
          status: 'completed', 
          output: '研究团队已就绪'
        },
        'researcher_start': { status: 'completed', output: 'started' },
        'agent': { 
          status: 'running', 
          output: '正在执行分析任务...',
          metadata: { progress: 0.6, currentStep: '数据处理' }
        }
      }
    },
    telemetry: {
      ...mockTelemetryResult,
      traceId: 'graph-trace-003'
    }
  }
];

// GraphRunActionParam模拟数据
export const mockGraphRunParams: GraphRunActionParam[] = [
  {
    graphName: 'research-workflow',
    input: {
      query: '分析用户反馈数据',
      dataset: 'customer_feedback_2024.csv',
      analysisType: 'sentiment_analysis',
      outputFormat: 'json'
    },
    stream: false
  },
  {
    graphName: 'simple-workflow',
    input: {
      task: '简单数据处理',
      inputData: ['item1', 'item2', 'item3']
    },
    stream: true
  },
  {
    graphName: 'researcher-subgraph',
    input: {
      researchTopic: '人工智能在医疗领域的应用',
      sources: ['pubmed', 'arxiv', 'google_scholar'],
      maxResults: 50
    },
    stream: false
  }
];

// GraphOptions模拟配置
export const mockGraphOptions: GraphOptions = {
  maxExecutionTime: 300000, // 5分钟
  enableParallelExecution: true,
  debugMode: false
};

// 工作流选项模拟数据
export const mockWorkflowOptions = [
  {
    value: 'workflow1',
    label: '客户反馈分析流程',
    description: '分析客户反馈，提取情感和建议'
  },
  {
    value: 'workflow2',
    label: '问题分类处理流程',
    description: '自动分类和处理客户问题'
  },
  {
    value: 'workflow3',
    label: '数据清洗和转换流程',
    description: '清洗原始数据并转换为目标格式'
  }
];

// Mermaid图形定义生成函数
export const generateMermaidDefinition = () => {
  return `
    graph TD
      %% 主流程
      START[__start__] --> COORD[coordinator]
      COORD --> PLANNER[planner]
      PLANNER --> HUMAN[human_feedback]
      HUMAN --> REPORTER[reporter]
      REPORTER --> END[__end__]
      
      %% 研究团队子图
      subgraph RESEARCH_TEAM ["researcher"]
        RS[__start__] --> AGENT[agent]
        AGENT --> TOOLS[tools]
        TOOLS --> RE[__end__]
        AGENT -.-> AGENT
      end
      
      %% 连接到研究团队
      CODER[coder] --> RT[research_team]
      RT --> RESEARCH_TEAM
      RESEARCH_TEAM --> RT
      RT --> COORD
      RT --> PLANNER
      PLANNER --> RT
      
      %% 其他连接
      HUMAN --> PLANNER
      
      %% 样式定义
      classDef startEnd fill:#f9f9f9,stroke:#666,stroke-width:2px,color:#000
      classDef coordinator fill:#e1f5fe,stroke:#0288d1,stroke-width:2px,color:#000
      classDef planner fill:#fff3e0,stroke:#f57c00,stroke-width:2px,color:#000
      classDef human fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000
      classDef reporter fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px,color:#000
      classDef coder fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#000
      classDef team fill:#e8eaf6,stroke:#3f51b5,stroke-width:2px,color:#000
      classDef agent fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000
      classDef tools fill:#fff8e1,stroke:#f9a825,stroke-width:2px,color:#000
      
      class START,END,RS,RE startEnd
      class COORD coordinator
      class PLANNER planner
      class HUMAN human
      class REPORTER reporter
      class CODER coder
      class RT team
      class AGENT agent
      class TOOLS tools
  `;
};

// Mermaid节点ID映射
export const mermaidNodeMap: Record<string, string> = {
  START: '__start__',
  COORD: 'coordinator',
  PLANNER: 'planner',
  HUMAN: 'human_feedback',
  REPORTER: 'reporter',
  END: '__end__',
  CODER: 'coder',
  RT: 'research_team',
  RS: 'researcher_start',
  AGENT: 'agent',
  TOOLS: 'tools',
  RE: 'researcher_end',
};

// 从Mermaid生成的节点ID中提取实际节点ID的函数
export const extractNodeId = (mermaidNodeId: string): string | null => {
  // Mermaid生成的ID格式通常是 "flowchart-XXX-YYY"
  // 我们需要映射回实际的节点ID
  for (const [key, value] of Object.entries(mermaidNodeMap)) {
    if (mermaidNodeId.includes(key)) {
      return value;
    }
  }
  return null;
};

// 默认导出主要的模拟数据
export default {
  mockNodes,
  mockGraphNodes,
  mockGraphEdges,
  mockGraphData,
  mockGraphRunResults,
  mockGraphRunParams,
  mockGraphOptions,
  mockWorkflowOptions,
  mockTelemetryResult,
  generateMermaidDefinition,
  mermaidNodeMap,
  extractNodeId
};
