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

import { useEffect, useState } from 'react';
import { Spin, Empty, message } from 'antd';
import { useParams } from 'ice';
import { GraphData } from '@/types/graphs';
import { Workbench } from '@/components/Graph';
import styles from './index.module.css';
import graphsService from '@/services/graphs';

type Params = {
  graph_name?: string;
};

// Graph Studio 主组件
export const GraphStudio: React.FC<{ graphData: GraphData }> = ({ graphData }) => {
  return <Workbench graphData={graphData} />;
};

// 主页面组件
export default function GraphsPage() {
  const params = useParams<Params>();
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (params.graph_name) {
          // 加载特定的图
          const data = await graphsService.getGraphByName(params.graph_name);
          setGraphData(data);
        } else {
          // 显示图列表或默认图
          const graphs = await graphsService.getGraphs();
          if (graphs.length > 0) {
            setGraphData(graphs[0]);
          } else {
            // 如果没有图数据，创建一个模拟的图数据
            setGraphData({
              id: 'demo-graph',
              name: 'Demo Graph',
              description: '演示图工作流',
              nodes: [],
              edges: [],
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch graph data:', error);
        message.error('加载图数据失败');
        // 创建一个模拟的图数据作为fallback
        setGraphData({
          id: 'demo-graph',
          name: 'Demo Graph',
          description: '演示图工作流',
          nodes: [],
          edges: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.graph_name]);

  if (loading) {
    return (
      <div className={styles['container']}>
        <Spin tip="Loading Graph Studio...">
          <div className={styles['message-loading']} />
        </Spin>
      </div>
    );
  }

  if (!graphData) {
    return (
      <div className={styles['container']}>
        <Empty
          description="未找到图数据"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return <GraphStudio graphData={graphData} />;
}
