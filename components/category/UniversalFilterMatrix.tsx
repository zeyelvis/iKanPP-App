'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface FilterParams {
  channel: string;
  region: string;
  lang: string;
  year: string;
  quality: string;
  status: string;
  sort: string;
}

interface UniversalFilterMatrixProps {
  /** 初始板块（例如 'movie', 'tv', 'anime', 'variety', 'documentary', 'short' 等） */
  defaultChannel?: string;
  /** 当前筛选结果总数，由外部传入或接口返回 */
  totalCount?: number;
  /** 加载中状态指示 */
  loading?: boolean;
  /** 筛选参数改变时的回调 */
  onFilterChange: (filters: FilterParams) => void;
  /** 可选副标题或专区名称 */
  channelTitle?: string;
}

// 1. 全部板块定义（聚焦平台 6 大核心影视专区）
const CHANNEL_OPTIONS = [
  { label: '电影', value: 'movie' },
  { label: '电视剧', value: 'tv' },
  { label: '综艺', value: 'variety' },
  { label: '动漫', value: 'anime' },
  { label: '短剧', value: 'short' },
  { label: '纪录片', value: 'documentary' },
];

// 2. 全部地区
const REGION_OPTIONS = [
  { label: '大陆', value: '大陆' },
  { label: '香港', value: '香港' },
  { label: '台湾', value: '台湾' },
  { label: '日本', value: '日本' },
  { label: '韩国', value: '韩国' },
  { label: '欧美', value: '欧美' },
  { label: '英国', value: '英国' },
  { label: '泰国', value: '泰国' },
  { label: '其它', value: '其它' },
];

// 3. 全部语言（分两排）
const LANG_OPTIONS_ROW1 = [
  { label: '国语', value: '国语' },
  { label: '粤语', value: '粤语' },
  { label: '英语', value: '英语' },
  { label: '韩语', value: '韩语' },
  { label: '日语', value: '日语' },
  { label: '西班牙语', value: '西班牙语' },
  { label: '法语', value: '法语' },
  { label: '德语', value: '德语' },
  { label: '意大利语', value: '意大利语' },
  { label: '泰国语', value: '泰国语' },
];

const LANG_OPTIONS_ROW2 = [
  { label: '其它', value: '其它' },
];

// 4. 全部年份
const YEAR_OPTIONS = [
  { label: '今年', value: '今年' },
  { label: '去年', value: '去年' },
  { label: '更早', value: '更早' },
  { label: '90年代', value: '90年代' },
  { label: '80年代', value: '80年代' },
  { label: '怀旧', value: '怀旧' },
];

// 5. 全部画质
const QUALITY_OPTIONS = [
  { label: '4K', value: '4K' },
  { label: '1080P', value: '1080P' },
  { label: '900P', value: '900P' },
  { label: '720P', value: '720P' },
];

// 6. 全部状态
const STATUS_OPTIONS = [
  { label: '全集', value: '全集' },
  { label: '连载中', value: '连载中' },
];

// 7. 排序方式
const SORT_OPTIONS = [
  { label: '添加时间', value: 'time_added' },
  { label: '更新时间', value: 'time_updated' },
  { label: '人气高低', value: 'popularity' },
  { label: '评分高低', value: 'rating' },
];

export function UniversalFilterMatrix({
  defaultChannel = 'movie',
  totalCount = 0,
  loading = false,
  onFilterChange,
  channelTitle,
}: UniversalFilterMatrixProps) {
  const router = useRouter();

  // 当前激活状态
  const [selectedChannel, setSelectedChannel] = useState<string>(defaultChannel);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedLang, setSelectedLang] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedQuality, setSelectedQuality] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedSort, setSelectedSort] = useState<string>('time_added');

  // 当外部传入的 defaultChannel 变动时同步（例如路由切换）
  useEffect(() => {
    if (defaultChannel) {
      setSelectedChannel(defaultChannel);
    }
  }, [defaultChannel]);

  // 当筛选参数变动时触发上层回调
  const notifyChange = useCallback(
    (overrides?: Partial<FilterParams>) => {
      const currentFilters: FilterParams = {
        channel: overrides?.channel !== undefined ? overrides.channel : selectedChannel,
        region: overrides?.region !== undefined ? overrides.region : selectedRegion,
        lang: overrides?.lang !== undefined ? overrides.lang : selectedLang,
        year: overrides?.year !== undefined ? overrides.year : selectedYear,
        quality: overrides?.quality !== undefined ? overrides.quality : selectedQuality,
        status: overrides?.status !== undefined ? overrides.status : selectedStatus,
        sort: overrides?.sort !== undefined ? overrides.sort : selectedSort,
      };
      onFilterChange(currentFilters);
    },
    [
      selectedChannel,
      selectedRegion,
      selectedLang,
      selectedYear,
      selectedQuality,
      selectedStatus,
      selectedSort,
      onFilterChange,
    ]
  );

  // 单独切换处理
  const handleChannelSelect = (channelVal: string) => {
    setSelectedChannel(channelVal);
    notifyChange({ channel: channelVal });
  };

  const handleRegionSelect = (regionVal: string) => {
    const nextVal = selectedRegion === regionVal ? '' : regionVal;
    setSelectedRegion(nextVal);
    notifyChange({ region: nextVal });
  };

  const handleLangSelect = (langVal: string) => {
    const nextVal = selectedLang === langVal ? '' : langVal;
    setSelectedLang(nextVal);
    notifyChange({ lang: nextVal });
  };

  const handleYearSelect = (yearVal: string) => {
    const nextVal = selectedYear === yearVal ? '' : yearVal;
    setSelectedYear(nextVal);
    notifyChange({ year: nextVal });
  };

  const handleQualitySelect = (qualityVal: string) => {
    const nextVal = selectedQuality === qualityVal ? '' : qualityVal;
    setSelectedQuality(nextVal);
    notifyChange({ quality: nextVal });
  };

  const handleStatusSelect = (statusVal: string) => {
    const nextVal = selectedStatus === statusVal ? '' : statusVal;
    setSelectedStatus(nextVal);
    notifyChange({ status: nextVal });
  };

  const handleSortSelect = (sortVal: string) => {
    setSelectedSort(sortVal);
    notifyChange({ sort: sortVal });
  };

  // 一键重置所有条件（保留当前板块）
  const handleResetFilters = () => {
    setSelectedRegion('');
    setSelectedLang('');
    setSelectedYear('');
    setSelectedQuality('');
    setSelectedStatus('');
    setSelectedSort('time_added');
    onFilterChange({
      channel: selectedChannel,
      region: '',
      lang: '',
      year: '',
      quality: '',
      status: '',
      sort: 'time_added',
    });
  };

  const hasActiveFilters = Boolean(
    selectedRegion || selectedLang || selectedYear || selectedQuality || selectedStatus || selectedSort !== 'time_added'
  );

  return (
    <div className="w-full bg-[#131926]/95 backdrop-blur-xl border border-[#1e2a3f] rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 text-sm select-none transition-all">
      {/* 顶部标题栏（可选显示当前大厅与一键重置） */}
      {channelTitle && (
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#1e2a3f]/70">
          <div className="flex items-center gap-2">
            <span className="w-2 h-4 bg-[#00a8ff] rounded-xs" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
              {(() => {
                const opt = CHANNEL_OPTIONS.find(c => c.value === selectedChannel);
                return opt ? `${opt.label}专区` : channelTitle;
              })()} · 全库工业级多维检索
            </h2>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-[#00a8ff] hover:text-[#38bdf8] flex items-center gap-1 font-medium cursor-pointer transition-colors"
            >
              <span>↺ 重置筛选</span>
            </button>
          )}
        </div>
      )}

      {/* 筛选矩阵主体 */}
      <div className="space-y-4 sm:space-y-4.5 pt-1">
        {/* 行 1：全部板块 */}
        <div className="flex items-start gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => handleChannelSelect('all')}
            className={`px-3.5 py-1.5 rounded-[3px] text-sm shrink-0 cursor-pointer font-medium transition-all text-center min-w-[88px] ${
              selectedChannel === 'all' || !selectedChannel
                ? 'bg-[#00a8ff] text-white shadow-sm'
                : 'text-[#8899aa] hover:text-white hover:bg-white/5'
            }`}
          >
            全部板块
          </button>
          <div className="flex flex-wrap items-center gap-x-6 sm:gap-x-7 gap-y-2 flex-1 pt-1">
            {CHANNEL_OPTIONS.map((item) => {
              const isActive = selectedChannel === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleChannelSelect(item.value)}
                  className={`text-sm cursor-pointer transition-colors rounded-[3px] ${
                    isActive
                      ? 'bg-[#00a8ff] text-white font-medium px-3 py-0.5 shadow-sm'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 行 2：全部地区 */}
        <div className="flex items-start gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => {
              setSelectedRegion('');
              notifyChange({ region: '' });
            }}
            className={`px-3.5 py-1.5 rounded-[3px] text-sm shrink-0 cursor-pointer font-medium transition-all text-center min-w-[88px] ${
              !selectedRegion
                ? 'bg-[#00a8ff] text-white shadow-sm'
                : 'text-[#8899aa] hover:text-white hover:bg-white/5'
            }`}
          >
            全部地区
          </button>
          <div className="flex flex-wrap items-center gap-x-6 sm:gap-x-7 gap-y-2 flex-1 pt-1">
            {REGION_OPTIONS.map((item) => {
              const isActive = selectedRegion === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleRegionSelect(item.value)}
                  className={`text-sm cursor-pointer transition-colors rounded-[3px] ${
                    isActive
                      ? 'bg-[#00a8ff] text-white font-medium px-3 py-0.5 shadow-sm'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 行 3：全部语言 */}
        <div className="flex items-start gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => {
              setSelectedLang('');
              notifyChange({ lang: '' });
            }}
            className={`px-3.5 py-1.5 rounded-[3px] text-sm shrink-0 cursor-pointer font-medium transition-all text-center min-w-[88px] ${
              !selectedLang
                ? 'bg-[#00a8ff] text-white shadow-sm'
                : 'text-[#8899aa] hover:text-white hover:bg-white/5'
            }`}
          >
            全部语言
          </button>
          <div className="flex flex-col gap-y-2.5 flex-1 pt-1">
            <div className="flex flex-wrap items-center gap-x-6 sm:gap-x-7 gap-y-2">
              {LANG_OPTIONS_ROW1.map((item) => {
                const isActive = selectedLang === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleLangSelect(item.value)}
                    className={`text-sm cursor-pointer transition-colors rounded-[3px] ${
                      isActive
                        ? 'bg-[#00a8ff] text-white font-medium px-3 py-0.5 shadow-sm'
                        : 'text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-x-6 sm:gap-x-7 gap-y-2">
              {LANG_OPTIONS_ROW2.map((item) => {
                const isActive = selectedLang === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => handleLangSelect(item.value)}
                    className={`text-sm cursor-pointer transition-colors rounded-[3px] ${
                      isActive
                        ? 'bg-[#00a8ff] text-white font-medium px-3 py-0.5 shadow-sm'
                        : 'text-[#94a3b8] hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 行 4：全部年份 */}
        <div className="flex items-start gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => {
              setSelectedYear('');
              notifyChange({ year: '' });
            }}
            className={`px-3.5 py-1.5 rounded-[3px] text-sm shrink-0 cursor-pointer font-medium transition-all text-center min-w-[88px] ${
              !selectedYear
                ? 'bg-[#00a8ff] text-white shadow-sm'
                : 'text-[#8899aa] hover:text-white hover:bg-white/5'
            }`}
          >
            全部年份
          </button>
          <div className="flex flex-wrap items-center gap-x-6 sm:gap-x-7 gap-y-2 flex-1 pt-1">
            {YEAR_OPTIONS.map((item) => {
              const isActive = selectedYear === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleYearSelect(item.value)}
                  className={`text-sm cursor-pointer transition-colors rounded-[3px] ${
                    isActive
                      ? 'bg-[#00a8ff] text-white font-medium px-3 py-0.5 shadow-sm'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 行 5：全部画质 */}
        <div className="flex items-start gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => {
              setSelectedQuality('');
              notifyChange({ quality: '' });
            }}
            className={`px-3.5 py-1.5 rounded-[3px] text-sm shrink-0 cursor-pointer font-medium transition-all text-center min-w-[88px] ${
              !selectedQuality
                ? 'bg-[#00a8ff] text-white shadow-sm'
                : 'text-[#8899aa] hover:text-white hover:bg-white/5'
            }`}
          >
            全部画质
          </button>
          <div className="flex flex-wrap items-center gap-x-6 sm:gap-x-7 gap-y-2 flex-1 pt-1">
            {QUALITY_OPTIONS.map((item) => {
              const isActive = selectedQuality === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleQualitySelect(item.value)}
                  className={`text-sm cursor-pointer transition-colors rounded-[3px] ${
                    isActive
                      ? 'bg-[#00a8ff] text-white font-medium px-3 py-0.5 shadow-sm'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 行 6：全部状态 */}
        <div className="flex items-start gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => {
              setSelectedStatus('');
              notifyChange({ status: '' });
            }}
            className={`px-3.5 py-1.5 rounded-[3px] text-sm shrink-0 cursor-pointer font-medium transition-all text-center min-w-[88px] ${
              !selectedStatus
                ? 'bg-[#00a8ff] text-white shadow-sm'
                : 'text-[#8899aa] hover:text-white hover:bg-white/5'
            }`}
          >
            全部状态
          </button>
          <div className="flex flex-wrap items-center gap-x-6 sm:gap-x-7 gap-y-2 flex-1 pt-1">
            {STATUS_OPTIONS.map((item) => {
              const isActive = selectedStatus === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleStatusSelect(item.value)}
                  className={`text-sm cursor-pointer transition-colors rounded-[3px] ${
                    isActive
                      ? 'bg-[#00a8ff] text-white font-medium px-3 py-0.5 shadow-sm'
                      : 'text-[#94a3b8] hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 第 7 行：底部工具条（排序方式 + 筛选结果统计） */}
      <div className="bg-[#182132] border-t border-[#1e2a3f] -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 px-4 sm:px-6 py-2.5 rounded-b-xl sm:rounded-b-2xl flex flex-wrap items-center justify-between gap-3 mt-6">
        {/* 左侧排序选项卡 */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {SORT_OPTIONS.map((item) => {
            const isActive = selectedSort === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => handleSortSelect(item.value)}
                className={`text-xs sm:text-sm font-medium transition-all px-3.5 py-1.5 rounded-[3px] cursor-pointer flex items-center gap-1 ${
                  isActive
                    ? 'bg-[#242c3d] text-white font-semibold shadow-xs'
                    : 'text-[#8899aa] hover:text-white hover:bg-white/5'
                }`}
              >
                <span>{item.label}</span>
                {isActive && item.value === 'time_added' && (
                  <span className="text-white text-xs">↓</span>
                )}
              </button>
            );
          })}
        </div>

        {/* 右侧结果数量统计 */}
        <div className="text-xs sm:text-sm text-[#8899aa] font-normal flex items-center gap-1.5">
          <span>共有</span>
          <span className="text-white font-bold tracking-wide">
            {loading && totalCount === 0 ? '...' : totalCount.toLocaleString()}
          </span>
          <span>个筛选结果</span>
        </div>
      </div>
    </div>
  );
}
