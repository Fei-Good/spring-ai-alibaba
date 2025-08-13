/**
 * Copyright 2024 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { useState, useEffect, useRef } from 'react';
import { GraphData } from '@/types/graphs';
import Graph from './Graph';
import Executor from './Executor';
import Result from './Result';
import styles from '@/pages/run/graphs/index.module.css';

interface WorkbenchProps {
  graphData: GraphData;
}

// 自定义事件类型
export interface GraphStudioEvent {
  type: 'init' | 'result' | 'graph-active' | 'state-updated' | 'node-selected' | 'debug-request';
  payload?: any;
}

// Workbench主布局容器组件
const Workbench: React.FC<WorkbenchProps> = ({ graphData }) => {
  const workbenchRef = useRef<HTMLDivElement>(null);

  // 全局状态管理
  const [currentThread, setCurrentThread] = useState<string>('');
  const [executionResults, setExecutionResults] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [debugNodes, setDebugNodes] = useState<string[]>([]);
  const [isExecutorExpanded, setIsExecutorExpanded] = useState(false);

  // 事件系统 - 组件间通信
  const dispatchEvent = (event: GraphStudioEvent) => {
    const customEvent = new CustomEvent('graph-studio-event', {
      detail: event,
    });
    workbenchRef.current?.dispatchEvent(customEvent);
  };

  // 监听自定义事件
  useEffect(() => {
    const handleEvent = (e: CustomEvent<GraphStudioEvent>) => {
      const { type, payload } = e.detail;

      switch (type) {
        case 'init':
          console.log('Workbench: Initialization event received', payload);
          break;

        case 'result':
          console.log('Workbench: Result event received', payload);
          setExecutionResults(prev => [...prev, payload]);
          break;

        case 'graph-active':
          console.log('Workbench: Graph active event received', payload);
          break;

        case 'state-updated':
          console.log('Workbench: State updated event received', payload);
          break;

        case 'node-selected':
          console.log('Workbench: Node selected event received', payload);
          setSelectedNode(payload.nodeId);
          break;

        case 'debug-request':
          console.log('Workbench: Debug request event received', payload);
          setDebugNodes(payload.nodes);
          break;

        default:
          console.log('Workbench: Unknown event type', type);
      }
    };

    const workbenchElement = workbenchRef.current;
    if (workbenchElement) {
      workbenchElement.addEventListener('graph-studio-event', handleEvent as EventListener);
      return () => {
        workbenchElement.removeEventListener('graph-studio-event', handleEvent as EventListener);
      };
    }
  }, []);

  // 处理线程选择
  const handleThreadSelect = (threadId: string) => {
    setCurrentThread(threadId);
    dispatchEvent({
      type: 'state-updated',
      payload: { currentThread: threadId },
    });
  };

  // 处理执行器展开/收起
  const handleExecutorToggle = () => {
    setIsExecutorExpanded(!isExecutorExpanded);
  };

  // 处理表单提交
  const handleSubmit = (formData: any) => {
    dispatchEvent({
      type: 'init',
      payload: { formData, graphData },
    });
  };

  // 处理节点点击
  const handleNodeClick = (nodeId: string) => {
    dispatchEvent({
      type: 'node-selected',
      payload: { nodeId },
    });
  };

  // 处理调试设置
  const handleDebugConfig = (nodes: string[]) => {
    dispatchEvent({
      type: 'debug-request',
      payload: { nodes },
    });
  };

  return (
    <div ref={workbenchRef} className={styles.workbench}>
      {/* Graph 可视化展示区 */}
      <div className={styles['graph-visualization-area']}>
        <Graph
          graphData={graphData}
          selectedNode={selectedNode}
          debugNodes={debugNodes}
          onNodeClick={handleNodeClick}
          onDebugConfig={handleDebugConfig}
          dispatchEvent={dispatchEvent}
        />

        <Executor
          graphData={graphData}
          isExpanded={isExecutorExpanded}
          onToggle={handleExecutorToggle}
          onSubmit={handleSubmit}
          dispatchEvent={dispatchEvent}
        />
      </div>

      {/* 工作流执行详细结果展示区 */}
      <div className={styles['result-area']}>
        <Result
          currentThread={currentThread}
          executionResults={executionResults}
          onThreadSelect={handleThreadSelect}
          dispatchEvent={dispatchEvent}
        />
      </div>
    </div>
  );
};

export default Workbench;
