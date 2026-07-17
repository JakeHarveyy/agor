import type { AgorClient, ExternalRun, ExternalRunStatus } from '@agor-live/client';
import { ThunderboltOutlined } from '@ant-design/icons';
import { Card, Drawer, Empty, List, Space, Tag, Tooltip, Typography, theme } from 'antd';
import type React from 'react';
import { useState } from 'react';
import { useExternalRuns } from '../../hooks/useExternalRuns';
import { formatRelativeTime } from '../../utils/time';
import { ExternalRunDetail } from '../ExternalRunsSection/ExternalRunsSection';
import { glassCardStyle } from './homeStyles';

const { Text } = Typography;

const STATUS_COLOR: Record<ExternalRunStatus, string> = {
  running: 'processing',
  completed: 'success',
  failed: 'error',
  abandoned: 'default',
};

const HOME_RUNS_LIMIT = 50;

/**
 * Home-page card surfacing recent External Runs (native-harness work logged
 * back to Agor). Mirrors HomeKnowledgeSection; clicking a run opens its detail
 * (timeline + links) in a Drawer, reusing the board lane's ExternalRunDetail.
 */
export const HomeExternalRunsSection: React.FC<{
  client: AgorClient | null;
  connected?: boolean;
}> = ({ client, connected }) => {
  const { token } = theme.useToken();
  const { runs, loading } = useExternalRuns(client);
  const [drawerRun, setDrawerRun] = useState<ExternalRun | null>(null);

  return (
    <section
      aria-label="External runs"
      style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 6 }}>
        <Tooltip title="Native-harness work (Claude Code, Codex) logged back to Agor as first-class External Runs. Click a run for its event timeline and linked artefacts.">
          <ThunderboltOutlined style={{ color: token.colorTextSecondary, fontSize: 13 }} />
        </Tooltip>
        <Text strong style={{ fontSize: 14 }}>
          External Runs
        </Text>
      </div>
      <Card
        loading={loading && runs.length === 0}
        style={{
          flex: 1,
          minHeight: 0,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadiusLG,
          ...glassCardStyle(token),
        }}
        styles={{
          body: {
            padding: 0,
            height: '100%',
            overflow: 'auto',
            background: 'transparent',
          },
        }}
      >
        {!connected ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Reconnect to refresh runs"
            style={{ padding: '24px 0' }}
          />
        ) : runs.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No external runs yet. Native Claude Code / Codex sessions log back here."
            style={{ padding: '24px 0' }}
          />
        ) : (
          <List
            rowKey="run_id"
            dataSource={runs.slice(0, HOME_RUNS_LIMIT)}
            renderItem={(run) => (
              <List.Item
                onClick={() => setDrawerRun(run)}
                style={{ cursor: 'pointer', padding: '10px 12px' }}
              >
                <List.Item.Meta
                  title={
                    <Space size={6} style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text ellipsis={{ tooltip: run.title }} style={{ minWidth: 0 }}>
                        {run.title}
                      </Text>
                      <Tag color={STATUS_COLOR[run.status]}>{run.status}</Tag>
                    </Space>
                  }
                  description={
                    <Space size={6} wrap>
                      <Tag>{run.harness}</Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {formatRelativeTime(run.created_at)}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
      <Drawer
        open={!!drawerRun}
        onClose={() => setDrawerRun(null)}
        width={440}
        destroyOnClose
        styles={{ body: { padding: 0 } }}
      >
        {drawerRun && (
          <ExternalRunDetail
            client={client}
            run={drawerRun}
            onBack={() => setDrawerRun(null)}
            backLabel="← Close"
          />
        )}
      </Drawer>
    </section>
  );
};

export default HomeExternalRunsSection;
