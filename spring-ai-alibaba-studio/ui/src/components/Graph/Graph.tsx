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
import { 
  mockNodes, 
  mockWorkflowOptions,
  generateMermaidDefinition,
  extractNodeId 
} from '@/mock/graphmock';
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

  // 使用从mock文件导入的extractNodeId函数

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
          {mockWorkflowOptions.map(option => (
            <Option key={option.value} value={option.value} title={option.description}>
              {option.label}
            </Option>
          ))}
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
      <Modal></Modal>
    </div>
  );
};

export default Graph;
