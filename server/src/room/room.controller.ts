import { Controller, Get, Post, Param, Query, Body, NotFoundException, HttpCode } from '@nestjs/common';
import { RoomService } from './room.service';
import { QueryHistoryDto } from './dto/query-history.dto';
import { AcControlDto } from './dto/ac-control.dto';
import type { RoomResponse, RoomDetailResponse, RoomHistoryPoint } from './dto/room-response.dto';

@Controller('api/rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  /**
   * 获取全屋房间列表
   *
   * 返回每个房间的 id、名称、图标、当前温湿度、在线状态和最后更新时间
   *
   * @returns 房间列表数组，不带传感器数据的房间字段为 null
   */
  @Get()
  getRooms(): RoomResponse[] {
    return this.roomService.findAll();
  }

  /**
   * 获取单个房间详情
   *
   * 包含当前温湿度、在线状态，以及设备数、空气质量、室外温度等扩展字段
   *
   * @param id - 房间标识（如 living、bedroom）
   * @returns 房间详情，不存在则返回 404
   */
  @Get(':id')
  getRoom(@Param('id') id: string): RoomDetailResponse {
    const room = this.roomService.findById(id);
    if (!room) {
      throw new NotFoundException(`Room ${id} not found`);
    }
    return room;
  }

  /**
   * 获取房间历史传感器数据
   *
   * 返回指定时间范围内的温湿度时序数据点。
   * 当前为模拟数据，接入 InfluxDB 后将替换为真实聚合查询。
   *
   * @param id - 房间标识
   * @param query - 查询参数（range: 1h/6h/24h/7d/30d，interval: 聚合粒度）
   * @returns 时序数据点数组，每个点包含 timestamp、temp、humi
   */
  @Get(':id/data')
  async getRoomHistory(
    @Param('id') id: string,
    @Query() query: QueryHistoryDto,
  ): Promise<RoomHistoryPoint[]> {
    return this.roomService.getHistory(id, query.range!, query.interval);
  }

  /**
   * 手动控制指定房间的空调
   *
   * 请求体经过 class-validator 校验后，通过 RoomService 转换为 MQTT 指令下发到 ESP32
   *
   * @param id - 目标房间标识
   * @param command - 空调控制指令（power 必填，mode/targetTemp/fanSpeed/swing 可选）
   * @returns 操作确认消息
   */
  @Post(':id/ac/control')
  async controlAc(@Param('id') id: string, @Body() command: AcControlDto) {
    await this.roomService.controlAc(id, command);
    return { message: `AC control sent to ${id}` };
  }
}
