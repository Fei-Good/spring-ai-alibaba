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
import { Button, Modal, Select, Checkbox, Space, Typography } from 'antd';
import {
  BugOutlined,
  SelectOutlined,
  SettingOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  FullscreenOutlined,
} from '@ant-design/icons';
import mermaid from 'mermaid';
import { GraphData } from '@/types/graphs';
import { GraphStudioEvent } from './Workbench';
import styles from '@/pages/run/graphs/index.module.css';

const { Text } = Typography;
const { Option } = Select;

interface GraphProps {
  graphData: GraphData;
  selectedNode: string | null;
  debugNodes: string[];
  onNodeClick: (nodeId: string) => void;
  onDebugConfig: (nodes: string[]) => void;
  dispatchEvent: (event: GraphStudioEvent) => void;
}

// Graph状态图可视化组件
const Graph: React.FC<GraphProps> = ({
  graphData,
  selectedNode,
  debugNodes,
  onNodeClick,
  onDebugConfig,
  dispatchEvent,
}) => {
  const mermaidRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isNodeModalVisible, setIsNodeModalVisible] = useState(false);
  const [isDebugModalVisible, setIsDebugModalVisible] = useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [currentNodeInfo, setCurrentNodeInfo] = useState<any>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [tempDebugNodes, setTempDebugNodes] = useState<string[]>([]);

  // 拖拽相关状态
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [lastTranslate, setLastTranslate] = useState({ x: 0, y: 0 });

  // 基于图片的模拟节点数据
  const mockNodes = [
    // 主流程节点
    { id: '__start__', name: '__start__', type: 'start', group: 'main' },
    { id: 'coordinator', name: 'coordinator', type: 'coordinator', group: 'main' },
    { id: 'planner', name: 'planner', type: 'planner', group: 'main' },
    { id: 'human_feedback', name: 'human_feedback', type: 'human', group: 'main' },
    { id: 'reporter', name: 'reporter', type: 'reporter', group: 'main' },
    { id: '__end__', name: '__end__', type: 'end', group: 'main' },

    // 研究团队子图节点
    { id: 'research_team', name: 'research_team', type: 'team', group: 'research' },
    { id: 'coder', name: 'coder', type: 'coder', group: 'research' },

    // 研究员子图节点
    { id: 'researcher_start', name: '__start__', type: 'start', group: 'researcher' },
    { id: 'agent', name: 'agent', type: 'agent', group: 'researcher' },
    { id: 'tools', name: 'tools', type: 'tools', group: 'researcher' },
    { id: 'researcher_end', name: '__end__', type: 'end', group: 'researcher' },
  ];

  // 生成符合图片效果的Mermaid图形定义
  const generateMermaidDefinition = () => {
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

  // 初始化Mermaid配置
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: false,
        htmlLabels: true,
        curve: 'basis',
      },
    });
  }, []);

  // 添加全局鼠标事件监听器以支持拖拽
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      e.preventDefault();

      const newTranslate = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };

      setTranslate(newTranslate);
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        setLastTranslate(translate);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }

    // 如果不在拖拽状态，返回空的清理函数
    return () => {};
  }, [isDragging, dragStart, translate]);

  // 渲染Mermaid图形
  useEffect(() => {
    const renderMermaid = async () => {
      if (mermaidRef.current) {
        try {
          // 清除之前的内容
          mermaidRef.current.innerHTML = '';

          // 生成唯一ID
          const graphId = `mermaid-graph-${Date.now()}`;

          // 获取Mermaid定义
          const definition = generateMermaidDefinition();

          // 渲染图形
          const { svg } = await mermaid.render(graphId, definition);
          mermaidRef.current.innerHTML = svg;

          // 添加节点点击事件
          const svgElement = mermaidRef.current.querySelector('svg');
          if (svgElement) {
            // 为所有节点添加点击事件
            const nodes = svgElement.querySelectorAll('.node');
            nodes.forEach((node) => {
              const nodeElement = node as HTMLElement;
              nodeElement.style.cursor = 'pointer';

              nodeElement.addEventListener('click', (e) => {
                e.stopPropagation();
                // 从节点ID中提取实际的节点名称
                const nodeId = nodeElement.id;
                const actualNodeId = extractNodeId(nodeId);
                if (actualNodeId) {
                  handleNodeClick(actualNodeId);
                }
              });

              // 添加悬停效果
              nodeElement.addEventListener('mouseenter', () => {
                nodeElement.style.opacity = '0.8';
              });

              nodeElement.addEventListener('mouseleave', () => {
                nodeElement.style.opacity = '1';
              });
            });
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          // 显示错误信息
          mermaidRef.current.innerHTML = `
            <div style="
              display: flex; 
              align-items: center; 
              justify-content: center; 
              height: 100%; 
              flex-direction: column;
              font-size: 16px;
              color: #ff4d4f;
            ">
              <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
              <div>图形渲染失败</div>
              <div style="font-size: 12px; margin-top: 8px;">请检查控制台错误信息</div>
            </div>
          `;
        }
      }
    };

    renderMermaid();
  }, [graphData, scale]);

  // 从Mermaid生成的节点ID中提取实际节点ID
  const extractNodeId = (mermaidNodeId: string): string | null => {
    // Mermaid生成的ID格式通常是 "flowchart-XXX-YYY"
    // 我们需要映射回实际的节点ID
    const nodeMap: Record<string, string> = {
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

    // 查找匹配的节点ID
    for (const [key, value] of Object.entries(nodeMap)) {
      if (mermaidNodeId.includes(key)) {
        return value;
      }
    }

    return null;
  };

  // 处理节点点击
  const handleNodeClick = (nodeId: string) => {
    const nodeInfo = mockNodes.find(node => node.id === nodeId);
    if (nodeInfo) {
      setCurrentNodeInfo(nodeInfo);
      setIsNodeModalVisible(true);
      onNodeClick(nodeId);
    }
  };

  // 处理缩放
  const handleZoom = (direction: 'in' | 'out') => {
    setScale(prev => {
      const newScale = direction === 'in' ? prev * 1.2 : prev / 1.2;
      return Math.max(0.1, Math.min(3, newScale));
    });
  };

  // 处理鼠标按下事件 - 开始拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    // 只有在点击空白区域时才开始拖拽（不是节点）
    const target = e.target as HTMLElement;
    if (target.closest('.node') || target.closest('button') || target.closest('.ant-modal')) {
      return;
    }

    setIsDragging(true);
    setDragStart({
      x: e.clientX - lastTranslate.x,
      y: e.clientY - lastTranslate.y,
    });

    // 阻止默认行为和事件冒泡
    e.preventDefault();
    e.stopPropagation();
  };

  // 处理鼠标离开事件 - 确保在鼠标离开容器时停止拖拽
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setLastTranslate(translate);
    }
  };

  // 重置图形位置
  const handleResetPosition = () => {
    setTranslate({ x: 0, y: 0 });
    setLastTranslate({ x: 0, y: 0 });
    setScale(1);
  };

  // 处理调试配置
  const handleDebugSubmit = () => {
    onDebugConfig(tempDebugNodes);
    setIsDebugModalVisible(false);
    setTempDebugNodes([]);
  };

  // 处理工作流选择
  const handleWorkflowSelect = (workflowId: string) => {
    setSelectedWorkflow(workflowId);
    dispatchEvent({
      type: 'graph-active',
      payload: { workflowId },
    });
  };

  // 处理节点中断设置
  const handleInterruptSetting = (type: 'before' | 'after') => {
    if (currentNodeInfo) {
      dispatchEvent({
        type: 'state-updated',
        payload: {
          nodeId: currentNodeInfo.id,
          interrupt: type,
        },
      });
      setIsNodeModalVisible(false);
    }
  };

  return (
    <div className={styles['graph-container']}>
      {/* 顶部浮动工具栏 */}
      <div className={styles['graph-top-toolbar']}>
        <Button
          size="small"
          icon={<BugOutlined />}
          onClick={() => setIsDebugModalVisible(true)}
        >
          调试
        </Button>

        <Select
          size="small"
          style={{ width: 200 }}
          placeholder="选择工作流"
          value={selectedWorkflow || undefined}
          onChange={handleWorkflowSelect}
        >
          <Option value="workflow1">客户反馈分析流程</Option>
          <Option value="workflow2">问题分类处理流程</Option>
        </Select>

        <Button
          size="small"
          icon={<ZoomInOutlined />}
          onClick={() => handleZoom('in')}
        />

        <Button
          size="small"
          icon={<ZoomOutOutlined />}
          onClick={() => handleZoom('out')}
        />

        <Button
          size="small"
          icon={<FullscreenOutlined />}
          onClick={handleResetPosition}
          title="重置位置和缩放"
        />
      </div>

      {/* Mermaid图形展示区 */}
      <div
        ref={mermaidRef}
        className={styles['mermaid-container']}
        style={{
          transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
          cursor: isDragging ? 'grabbing' : 'grab',
          userSelect: 'none',
          transition: isDragging ? 'none' : 'transform 0.2s ease-out',
        }}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          // 点击事件已通过Mermaid渲染后的事件监听器处理
          e.preventDefault();
        }}
      />

      {/* 底部浮动工具栏 */}
      <div className={styles['graph-bottom-toolbar']}>
        <Button
          size="small"
          icon={<SelectOutlined />}
        >
          展开输入
        </Button>

        <Button
          size="small"
          icon={<SettingOutlined />}
          onClick={() => setIsSettingsModalVisible(true)}
        >
          设置
        </Button>

        <Button
          type="primary"
          size="small"
        >
          执行图
        </Button>
      </div>

      {/* 节点信息弹框 */}
      <Modal
        title="节点信息"
        open={isNodeModalVisible}
        onCancel={() => setIsNodeModalVisible(false)}
        footer={null}
        className={styles['node-modal']}
      >
        {currentNodeInfo && (
          <div>
            <div className={styles['node-info']}>
              <p><Text strong>节点ID:</Text> {currentNodeInfo.id}</p>
              <p><Text strong>节点名称:</Text> {currentNodeInfo.name}</p>
              <p><Text strong>节点类型:</Text> {currentNodeInfo.type}</p>
            </div>

            <div className={styles['node-actions']}>
              <Button
                onClick={() => handleInterruptSetting('before')}
              >
                Interrupt Before
              </Button>
              <Button
                onClick={() => handleInterruptSetting('after')}
              >
                Interrupt After
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 调试配置弹框 */}
      <Modal
        title="调试配置"
        open={isDebugModalVisible}
        onOk={handleDebugSubmit}
        onCancel={() => setIsDebugModalVisible(false)}
        className={styles['debug-modal']}
      >
        <div className={styles['debug-nodes']}>
          <Text>选择要调试的节点:</Text>
          <div style={{ marginTop: 12 }}>
            {mockNodes.map(node => (
              <div key={node.id} style={{ marginBottom: 8 }}>
                <Checkbox
                  checked={tempDebugNodes.includes(node.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setTempDebugNodes([...tempDebugNodes, node.id]);
                    } else {
                      setTempDebugNodes(tempDebugNodes.filter(id => id !== node.id));
                    }
                  }}
                >
                  {node.name} ({node.id})
                </Checkbox>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* 设置弹框 */}
      <Modal
        title="图形设置"
        open={isSettingsModalVisible}
        onCancel={() => setIsSettingsModalVisible(false)}
        footer={null}
        className={styles['settings-modal']}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>显示设置</Text>
            <div style={{ marginTop: 8 }}>
              <Checkbox>显示节点标签</Checkbox>
              <Checkbox>显示连接线标签</Checkbox>
              <Checkbox>启用动画效果</Checkbox>
            </div>
          </div>

          <div>
            <Text strong>交互设置</Text>
            <div style={{ marginTop: 8 }}>
              <Checkbox>允许拖拽节点</Checkbox>
              <Checkbox>允许缩放</Checkbox>
              <Checkbox>自动布局</Checkbox>
            </div>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default Graph;
