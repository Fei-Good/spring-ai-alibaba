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


import { request } from 'ice';
import { 
  mockGraphData, 
  mockGraphRunResults,
  mockGraphRunParams
} from '@/mock/graphmock';


export default {
  // 获取Graphs列表
  async getGraphs(): Promise<GraphData[]> {
    // 在开发环境下使用mock数据
    if (process.env.NODE_ENV === 'development') {
      return new Promise(resolve => {
        setTimeout(() => resolve(mockGraphData), 500); // 模拟网络延迟
      });
    }
    
    return await request({
      url: '/studio/api/graphs',
      method: 'get',
    });
  },

  // 根据graph name获取Graph
  async getGraphByName(name: string): Promise<GraphData> {
    // 在开发环境下使用mock数据
    if (process.env.NODE_ENV === 'development') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const graph = mockGraphData.find(g => g.name === name || g.id === name);
          if (graph) {
            resolve(graph);
          } else {
            reject(new Error(`Graph not found: ${name}`));
          }
        }, 300);
      });
    }
    
    return await request({
      url: `/studio/api/graphs/${name}`,
      method: 'get',
    });
  },

  async postGraph(data: GraphRunActionParam): Promise<GraphRunResult> {
    // 在开发环境下使用mock数据
    if (process.env.NODE_ENV === 'development') {
      return new Promise(resolve => {
        setTimeout(() => {
          // 根据输入参数返回不同的运行结果
          const mockResult = mockGraphRunResults[0]; // 默认返回成功结果
          const result: GraphRunResult = {
            ...mockResult,
            id: 'run-' + Date.now(),
            result: {
              ...mockResult.result,
              output: {
                message: `图 "${data.graphName}" 执行成功`,
                input: data.input,
                executionTime: (Math.random() * 5 + 1).toFixed(1) + '秒'
              }
            }
          };
          resolve(result);
        }, 1000); // 模拟执行时间
      });
    }
    
    return await request({
      url: '/studio/api/graphs',
      method: 'post',
      data,
    });
  },

  // 获取模拟的运行参数示例
  getMockRunParams(): GraphRunActionParam[] {
    return mockGraphRunParams;
  },

  // 获取模拟的运行结果
  getMockRunResults(): GraphRunResult[] {
    return mockGraphRunResults;
  },
};
