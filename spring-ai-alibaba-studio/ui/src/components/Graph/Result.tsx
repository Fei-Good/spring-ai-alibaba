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

import React, { useState, useEffect } from 'react';
import {
  Select,
  Collapse,
  Avatar,
  Typography,
  Space,
  Tag,
  Button,
  Tooltip,
  Divider,
} from 'antd';
import {
  UserOutlined,
  RobotOutlined,
  ClockCircleOutlined,
  DownOutlined,
  RightOutlined,
  EyeOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { GraphStudioEvent } from './Workbench';
import styles from '@/pages/run/graphs/index.module.css';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

interface ResultProps {
  currentThread: string;
  executionResults: any[];
  onThreadSelect: (threadId: string) => void;
  dispatchEvent: (event: GraphStudioEvent) => void;
}

// 消息类型
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  nodeId?: string;
  summary?: string;
  details?: any;
}

// Turn数据类型
interface Turn {
  id: string;
  turnNumber: number;
  timestamp: string;
  messages: Message[];
  status: 'running' | 'completed' | 'error';
  totalSteps?: number;
  currentStep?: number;
}

// Result结果展示组件
const Result: React.FC<ResultProps> = ({
  currentThread,
  executionResults,
  onThreadSelect,
  dispatchEvent,
}) => {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [activeTurns, setActiveTurns] = useState<string[]>(['1']);
  const [availableThreads, setAvailableThreads] = useState<string[]>([]);

  // 模拟的线程数据
  const mockThreads = [
    'Thread 526b1f3d-6c75-415d-8e6b-e047d8...',
    'Thread 5231f93-d80e-462d-b7ea-8ebe950ca22',
    'Thread 789abc12-3def-4567-8901-234567890abc',
  ];

  // 模拟的Turn数据
  const mockTurns: Turn[] = [
    {
      id: '1',
      turnNumber: 1,
      timestamp: '23小时前',
      status: 'completed',
      totalSteps: 4,
      currentStep: 4,
      messages: [
        {
          id: 'm1',
          role: 'user',
          content: '__start__',
          timestamp: '23小时前',
          nodeId: '__start__',
        },
        {
          id: 'm2',
          role: 'assistant',
          content: '反馈分类完成，识别为产品问题',
          timestamp: '23小时前',
          nodeId: 'feedback_classifier',
          summary: '反馈分类结果',
        },
        {
          id: 'm3',
          role: 'assistant',
          content: '问题进一步分类为UI界面问题',
          timestamp: '23小时前',
          nodeId: 'specific_question_classifier',
          summary: '具体问题分类',
        },
      ],
    },
    {
      id: '2',
      turnNumber: 2,
      timestamp: '23小时前',
      status: 'running',
      totalSteps: 4,
      currentStep: 2,
      messages: [
        {
          id: 'm4',
          role: 'user',
          content: '__start__',
          timestamp: '23小时前',
          nodeId: '__start__',
        },
        {
          id: 'm5',
          role: 'assistant',
          content: '正在处理新的反馈...',
          timestamp: '23小时前',
          nodeId: 'feedback_classifier',
          summary: '处理中',
        },
      ],
    },
  ];

  // 初始化数据
  useEffect(() => {
    setTurns(mockTurns);
    setAvailableThreads(mockThreads);
  }, []);

  // 处理执行结果更新
  useEffect(() => {
    if (executionResults.length > 0) {
      const latestResult = executionResults[executionResults.length - 1];

      // 更新Turn数据
      const newMessage: Message = {
        id: `m_${Date.now()}`,
        role: 'assistant',
        content: JSON.stringify(latestResult.data, null, 2),
        timestamp: latestResult.timestamp,
        summary: `执行结果 - ${latestResult.type}`,
      };

      setTurns(prevTurns => {
        const updatedTurns = [...prevTurns];
        if (updatedTurns.length > 0) {
          updatedTurns[0].messages.push(newMessage);
        } else {
          updatedTurns.push({
            id: '1',
            turnNumber: 1,
            timestamp: latestResult.timestamp,
            status: 'completed',
            messages: [newMessage],
          });
        }
        return updatedTurns;
      });
    }
  }, [executionResults]);

  // 渲染消息头像
  const renderMessageAvatar = (message: Message) => {
    const avatarProps = {
      size: 32 as const,
      style: { flexShrink: 0 },
    };

    switch (message.role) {
      case 'user':
        return <Avatar {...avatarProps} icon={<UserOutlined />} />;
      case 'assistant':
        return <Avatar {...avatarProps} icon={<RobotOutlined />} style={{ backgroundColor: '#52c41a' }} />;
      case 'system':
        return <Avatar {...avatarProps} style={{ backgroundColor: '#1890ff' }}>S</Avatar>;
      default:
        return <Avatar {...avatarProps} icon={<RobotOutlined />} />;
    }
  };

  // 渲染消息内容
  const renderMessageContent = (message: Message) => {
    return (
      <div className={styles['message-content']}>
        <div className={styles['message-time']}>
          <Space size={4}>
            <ClockCircleOutlined />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {message.timestamp}
            </Text>
            {message.nodeId && (
              <Tag color="blue">
                {message.nodeId}
              </Tag>
            )}
          </Space>
        </div>

        {message.summary && (
          <Text strong style={{ display: 'block', marginBottom: 4 }}>
            {message.summary}
          </Text>
        )}

        <div className={styles['message-text']}>
          <Paragraph
            copyable={message.content.length > 50}
            ellipsis={{ rows: 3, expandable: true, symbol: '展开' }}
          >
            {message.content}
          </Paragraph>
        </div>
      </div>
    );
  };

  // 渲染Turn状态
  const renderTurnStatus = (turn: Turn) => {
    const statusConfig = {
      running: { color: '#1890ff', text: '运行中' },
      completed: { color: '#52c41a', text: '已完成' },
      error: { color: '#ff4d4f', text: '错误' },
    };

    const config = statusConfig[turn.status];

    return (
      <Space>
        <Tag color={config.color}>{config.text}</Tag>
        {turn.totalSteps && (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {turn.currentStep || 0}/{turn.totalSteps} 步骤
          </Text>
        )}
      </Space>
    );
  };

  // 处理Turn展开/收起
  const handleTurnChange = (keys: string | string[]) => {
    setActiveTurns(Array.isArray(keys) ? keys : [keys]);
  };

  // 处理查看详细状态
  const handleViewState = (turnId: string) => {
    dispatchEvent({
      type: 'state-updated',
      payload: { action: 'view-state', turnId },
    });
  };

  return (
    <div className={styles['result-area']}>
      {/* 顶部线程选择 */}
      <div className={styles['result-header']}>
        <Select
          style={{ width: '100%' }}
          placeholder="选择线程"
          value={currentThread || undefined}
          onChange={onThreadSelect}
          dropdownMatchSelectWidth={false}
        >
          {availableThreads.map((thread, index) => (
            <Option key={thread} value={thread}>
              Thread {thread.substring(0, 20)}...
            </Option>
          ))}
        </Select>
      </div>

      {/* Turn列表 */}
      <div className={styles['result-content']}>
        <Collapse
          activeKey={activeTurns}
          onChange={handleTurnChange}
          expandIcon={({ isActive }) => (
            isActive ? <DownOutlined /> : <RightOutlined />
          )}
        >
          {turns.map(turn => (
            <Panel
              key={turn.id}
              header={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <Space>
                    <Text strong>TURN {turn.turnNumber}</Text>
                    {renderTurnStatus(turn)}
                  </Space>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {turn.timestamp}
                  </Text>
                </div>
              }
              extra={
                <Space onClick={e => e.stopPropagation()}>
                  <Tooltip title="查看状态">
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewState(turn.id)}
                    />
                  </Tooltip>
                  <Button size="small" icon={<MoreOutlined />} />
                </Space>
              }
              className={styles['turn-card']}
            >
              <div className={styles['turn-content']}>
                {turn.messages.map(message => (
                  <div key={message.id} className={styles['message-item']}>
                    {renderMessageAvatar(message)}
                    {renderMessageContent(message)}
                  </div>
                ))}

                {turn.status === 'running' && (
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <Text type="secondary">执行中...</Text>
                  </div>
                )}
              </div>
            </Panel>
          ))}
        </Collapse>

        {turns.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999',
          }}
          >
            <Text>暂无执行结果</Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default Result;