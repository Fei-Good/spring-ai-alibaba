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
import { Spin, message } from 'antd';
import { useParams } from 'ice';
import { GraphData } from '@/types/graphs';
import graphsService from '@/services/graphs';
import { GraphStudio } from './index';
import styles from './index.module.css';

type Params = {
  graph_name: string;
};

export default function Graph() {
  // 路径参数
  const params = useParams<Params>();
  const [graphData, setGraphData] = useState<GraphData>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await graphsService.getGraphByName(
          params.graph_name as string,
        );
        setGraphData(data);
      } catch (error) {
        console.error('Failed to fetch graph data: ', error);
        message.error('加载图数据失败');
      }
    };
    fetchData();
  }, [params]);

  // 直接重定向到通用的graphs页面，传递graph_name参数
  useEffect(() => {
    if (graphData) {
      // 这里可以设置特定图的状态或配置
      console.log('Loading specific graph:', graphData.name);
    }
  }, [graphData]);

  return graphData ? (
    <div style={{ padding: 20, height: '100%' }}>
      <GraphStudio graphData={graphData} />
    </div>
  ) : (
    <div className={styles['container']}>
      <Spin tip="Loading">
        <div className={styles['message-loading']} />
      </Spin>
    </div>
  );
}
