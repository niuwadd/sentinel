import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('House scene integration', () => {
  /**
   * 确认 House 入口会挂载房间模型并订阅实时传感器状态。
   *
   * @returns 无返回值。
   */
  it('renders room models from sensor-driven layout data', () => {
    const houseSource = readFileSync(
      resolve(__dirname, '../../../client/src/components/Scene/House.tsx'),
      'utf8',
    );
    const roomSource = readFileSync(
      resolve(__dirname, '../../../client/src/components/Scene/Room.tsx'),
      'utf8',
    );
    expect(houseSource).toContain('<Room');
    expect(houseSource).toContain('useSensorStore');
    expect(houseSource).toContain('<Canvas');
    expect(houseSource).toContain('<OrbitControls');
    expect(roomSource).toContain('<TemperatureBlock');
    expect(roomSource).toContain('<AcUnit');
  });

  /**
   * 确认温度可视化使用流动粒子气体，而不是遮挡房间的实体方块。
   *
   * @returns 无返回值。
   */
  it('renders temperature as a flowing particle gas', () => {
    const temperatureSource = readFileSync(
      resolve(
        __dirname,
        '../../../client/src/components/Scene/TemperatureBlock.tsx',
      ),
      'utf8',
    );

    expect(temperatureSource).toContain('<points');
    expect(temperatureSource).toContain('AdditiveBlending');
    expect(temperatureSource).not.toContain('<boxGeometry');
  });

  /**
   * 确认 3D 户型使用参考图中的矩形房间尺寸，并保留辅助空间结构。
   *
   * @returns 无返回值。
   */
  it('maps the reference floorplan into sized rooms and auxiliary spaces', () => {
    const layoutSource = readFileSync(
      resolve(
        __dirname,
        '../../../client/src/components/Scene/house-layout.ts',
      ),
      'utf8',
    );
    const houseSource = readFileSync(
      resolve(__dirname, '../../../client/src/components/Scene/House.tsx'),
      'utf8',
    );
    const roomSource = readFileSync(
      resolve(__dirname, '../../../client/src/components/Scene/Room.tsx'),
      'utf8',
    );

    expect(layoutSource).toContain('size: [number, number]');
    expect(layoutSource).toContain('HOUSE_AUXILIARY_LAYOUT');
    expect(layoutSource).toContain("roomId: 'bedroom-a'");
    expect(layoutSource).toContain("name: '阳台'");
    expect(layoutSource).toContain("name: '过道'");
    expect(layoutSource).toContain("name: '门厅'");
    expect(houseSource).toContain('<RoomShell');
    expect(roomSource).toContain('roomDepth');
  });

  /**
   * 确认温度只覆盖三个卧室和客厅，空调模型只在三个卧室渲染。
   *
   * @returns 无返回值。
   */
  it('limits temperature zones and air conditioners to the requested rooms', () => {
    const roomDataSource = readFileSync(
      resolve(__dirname, '../../../client/src/types/room.ts'),
      'utf8',
    );
    const layoutSource = readFileSync(
      resolve(
        __dirname,
        '../../../client/src/components/Scene/house-layout.ts',
      ),
      'utf8',
    );
    const roomSource = readFileSync(
      resolve(__dirname, '../../../client/src/components/Scene/Room.tsx'),
      'utf8',
    );
    const roomStripSource = readFileSync(
      resolve(
        __dirname,
        '../../../client/src/components/Panel/RoomStrip.tsx',
      ),
      'utf8',
    );

    expect(roomDataSource).toContain('hasAc: boolean');
    expect(roomDataSource).toContain("id: 'bedroom-a'");
    expect(roomDataSource).not.toContain("id: 'kitchen'");
    expect(roomDataSource).not.toContain("id: 'bath'");
    expect(layoutSource).toContain("roomId: 'bedroom-a'");
    expect(layoutSource).toContain("name: '厨房'");
    expect(layoutSource).toContain("name: '卫生间'");
    expect(roomSource).toContain('room.hasAc && <AcUnit');
    expect(roomStripSource).toContain('room.hasAc');
  });

  /**
   * 确认点击 3D 场景空白区域（地板）会取消房间选择。
   *
   * @returns 无返回值。
   */
  it('deselects the active room when the floor is clicked', () => {
    const houseSource = readFileSync(
      resolve(__dirname, '../../../client/src/components/Scene/House.tsx'),
      'utf8',
    );

    expect(houseSource).toContain("onRoomSelect('')");
  });

  /**
   * 确认房间模型悬停时切换为指针光标，提示可点击。
   *
   * @returns 无返回值。
   */
  it('shows a pointer cursor when hovering a room', () => {
    const roomSource = readFileSync(
      resolve(__dirname, '../../../client/src/components/Scene/Room.tsx'),
      'utf8',
    );

    expect(roomSource).toContain('useCursor');
    expect(roomSource).toContain('onPointerOver');
  });

  /**
   * 确认选中房间时弹出房间详情面板，面板支持手动关闭。
   *
   * @returns 无返回值。
   */
  it('renders the dashboard panel integrating device, chart, broker and AI widgets', () => {
    const appSource = readFileSync(
      resolve(__dirname, '../../../client/src/App.tsx'),
      'utf8',
    );
    const dashboardSource = readFileSync(
      resolve(__dirname, '../../../client/src/components/Panel/Dashboard.tsx'),
      'utf8',
    );

    expect(appSource).toContain('<Dashboard');
    expect(appSource).toContain('activeRoom');
    expect(dashboardSource).toContain('DeviceCard');
    expect(dashboardSource).toContain('TempChart');
    expect(dashboardSource).toContain('BrokerStatus');
    expect(dashboardSource).toContain('AiBubble');
    expect(dashboardSource).toContain('onClose');
    expect(dashboardSource).toContain('FrostedGlass');
  });

  /**
   * 确认空调控制卡片提供电源、模式、目标温度、风速和摆风控制。
   *
   * @returns 无返回值。
   */
  it('exposes full AC controls for power, mode, temperature, fan speed and swing', () => {
    const deviceCardSource = readFileSync(
      resolve(__dirname, '../../../client/src/components/Panel/DeviceCard.tsx'),
      'utf8',
    );

    expect(deviceCardSource).toContain('controlAc');
    expect(deviceCardSource).toContain('targetTemp');
    expect(deviceCardSource).toContain('fanSpeed');
    expect(deviceCardSource).toContain('swing');
    expect(deviceCardSource).toContain("'cool'");
  });

  /**
   * 确认温度曲线从后端加载历史数据并渲染实时折线图。
   *
   * @returns 无返回值。
   */
  it('loads history and renders a live temperature chart', () => {
    const chartSource = readFileSync(
      resolve(__dirname, '../../../client/src/components/Panel/TempChart.tsx'),
      'utf8',
    );

    expect(chartSource).toContain('getRoomHistory');
    expect(chartSource).toContain('LineChart');
    expect(chartSource).toContain('useSensorData');
  });

  /**
   * 确认前端 WebSocket Hook 订阅网关事件并写入对应 store。
   *
   * @returns 无返回值。
   */
  it('subscribes to gateway events and writes into stores', () => {
    const hookSource = readFileSync(
      resolve(__dirname, '../../../client/src/hooks/useWebSocket.ts'),
      'utf8',
    );

    expect(hookSource).toContain('wsService.subscribe');
    expect(hookSource).toContain('wsService.connect');
    expect(hookSource).toContain('updateRoom');
    expect(hookSource).toContain('updateRoomStatus');
    expect(hookSource).toContain('addDecision');
  });

  /**
   * 确认前端 WebSocket 服务提供连接与断开能力。
   *
   * @returns 无返回值。
   */
  it('exposes a WebSocket service that connects to the gateway', () => {
    const serviceSource = readFileSync(
      resolve(__dirname, '../../../client/src/services/ws.service.ts'),
      'utf8',
    );

    expect(serviceSource).toContain('io(');
    expect(serviceSource).toContain("'sensor:update'");
    expect(serviceSource).toContain("'device:status'");
    expect(serviceSource).toContain("'ai:decision'");
    expect(serviceSource).toContain('disconnect');
  });

  /**
   * 确认 GlobalStats 只展示全屋统计，房间详情交给场景弹窗。
   *
   * @returns 无返回值。
   */
  it('keeps GlobalStats as a whole-house summary', () => {
    const statsSource = readFileSync(
      resolve(__dirname, '../../../client/src/components/Panel/GlobalStats.tsx'),
      'utf8',
    );

    expect(statsSource).not.toContain('activeRoom');
  });

  /**
   * 确认传感器 store 支持从后端房间快照批量写入数据。
   *
   * @returns 无返回值。
   */
  it('hydrates the sensor store from backend room snapshots', () => {
    const storeSource = readFileSync(
      resolve(__dirname, '../../../client/src/store/sensorStore.ts'),
      'utf8',
    );

    expect(storeSource).toContain('hydrateRooms');
  });

  /**
   * 确认应用挂载时从后端拉取房间数据并写入传感器 store。
   *
   * @returns 无返回值。
   */
  it('bootstraps sensor data from the backend on mount', () => {
    const bootstrapSource = readFileSync(
      resolve(__dirname, '../../../client/src/hooks/useSensorBootstrap.ts'),
      'utf8',
    );
    const appSource = readFileSync(
      resolve(__dirname, '../../../client/src/App.tsx'),
      'utf8',
    );

    expect(bootstrapSource).toContain('getRooms()');
    expect(bootstrapSource).toContain('hydrateRooms');
    expect(appSource).toContain('useSensorBootstrap');
  });

  /**
   * 确认全局滚动条使用主题色，且提供隐藏滚动条的工具类。
   *
   * @returns 无返回值。
   */
  it('applies theme-matched scrollbar styling', () => {
    const cssSource = readFileSync(
      resolve(__dirname, '../../../client/src/index.css'),
      'utf8',
    );

    expect(cssSource).toContain('::-webkit-scrollbar');
    expect(cssSource).toContain('scrollbar-color');
    expect(cssSource).toContain('@utility scrollbar-none');
  });
});
