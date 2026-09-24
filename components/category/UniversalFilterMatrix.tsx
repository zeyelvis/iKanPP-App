'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface FilterParams {
  channel: string;
  genre: string;
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

// 1.5 全量精细题材分类标签库（按 6 大专区智能动态联动，支持多重模糊召回）
const CHANNEL_GENRES: Record<string, Array<{ label: string; value: string }>> = {
  all: [
    { label: '动作', value: '动作' },
    { label: '喜剧', value: '喜剧' },
    { label: '爱情', value: '爱情' },
    { label: '科幻', value: '科幻' },
    { label: '悬疑', value: '悬疑' },
    { label: '犯罪', value: '犯罪' },
    { label: '警匪', value: '警匪' },
    { label: '古装', value: '古装' },
    { label: '仙侠', value: '仙侠' },
    { label: '都市', value: '都市' },
    { label: '武侠', value: '武侠' },
    { label: '战争', value: '战争' },
    { label: '谍战', value: '谍战' },
    { label: '灾难', value: '灾难' },
    { label: '冒险', value: '冒险' },
    { label: '奇幻', value: '奇幻' },
    { label: '热血', value: '热血' },
    { label: '修真', value: '修真' },
    { label: '剧情', value: '剧情' },
    { label: '惊悚', value: '惊悚' },
    { label: '真人秀', value: '真人秀' },
    { label: '脱口秀', value: '脱口秀' },
    { label: '战神', value: '战神' },
    { label: '豪门', value: '豪门' },
    { label: '自然', value: '自然' },
    { label: '历史', value: '历史' },
  ],
  movie: [
    { label: '动作', value: '动作' },
    { label: '喜剧', value: '喜剧' },
    { label: '爱情', value: '爱情' },
    { label: '科幻', value: '科幻' },
    { label: '悬疑', value: '悬疑' },
    { label: '犯罪', value: '犯罪' },
    { label: '警匪', value: '警匪' },
    { label: '枪战', value: '枪战' },
    { label: '谍战', value: '谍战' },
    { label: '惊悚', value: '惊悚' },
    { label: '恐怖', value: '恐怖' },
    { label: '战争', value: '战争' },
    { label: '灾难', value: '灾难' },
    { label: '冒险', value: '冒险' },
    { label: '奇幻', value: '奇幻' },
    { label: '魔幻', value: '魔幻' },
    { label: '武侠', value: '武侠' },
    { label: '历史', value: '历史' },
    { label: '剧情', value: '剧情' },
    { label: '传记', value: '传记' },
    { label: '动画', value: '动画' },
    { label: '歌舞', value: '歌舞' },
  ],
  tv: [
    { label: '古装', value: '古装' },
    { label: '仙侠', value: '仙侠' },
    { label: '都市', value: '都市' },
    { label: '悬疑', value: '悬疑' },
    { label: '刑侦', value: '刑侦' },
    { label: '谍战', value: '谍战' },
    { label: '言情', value: '言情' },
    { label: '年代', value: '年代' },
    { label: '商战', value: '商战' },
    { label: '军旅', value: '军旅' },
    { label: '武侠', value: '武侠' },
    { label: '科幻', value: '科幻' },
    { label: '律政', value: '律政' },
    { label: '医疗', value: '医疗' },
    { label: '家庭', value: '家庭' },
    { label: '偶像', value: '偶像' },
    { label: '历史', value: '历史' },
    { label: '奇幻', value: '奇幻' },
    { label: '青春', value: '青春' },
    { label: '情景', value: '情景' },
  ],
  anime: [
    { label: '热血', value: '热血' },
    { label: '修真', value: '修真' },
    { label: '玄幻', value: '玄幻' },
    { label: '冒险', value: '冒险' },
    { label: '科幻', value: '科幻' },
    { label: '搞笑', value: '搞笑' },
    { label: '奇幻', value: '奇幻' },
    { label: '穿越', value: '穿越' },
    { label: '异世界', value: '异世界' },
    { label: '战斗', value: '战斗' },
    { label: '校园', value: '校园' },
    { label: '恋爱', value: '恋爱' },
    { label: '日常', value: '日常' },
    { label: '治愈', value: '治愈' },
    { label: '机战', value: '机战' },
    { label: '推理', value: '推理' },
    { label: '古风', value: '古风' },
    { label: '萌系', value: '萌系' },
    { label: '游戏', value: '游戏' },
    { label: '悬疑', value: '悬疑' },
  ],
  variety: [
    { label: '真人秀', value: '真人秀' },
    { label: '脱口秀', value: '脱口秀' },
    { label: '音乐现场', value: '音乐' },
    { label: '搞笑', value: '搞笑' },
    { label: '竞技户外', value: '竞技' },
    { label: '恋爱观察', value: '恋爱' },
    { label: '访谈', value: '访谈' },
    { label: '相声', value: '相声' },
    { label: '生活', value: '生活' },
    { label: '美食', value: '美食' },
    { label: '情感', value: '情感' },
    { label: '选秀', value: '选秀' },
    { label: '游戏', value: '游戏' },
    { label: '文化', value: '文化' },
    { label: '晚会盛典', value: '晚会' },
    { label: '亲子', value: '亲子' },
    { label: '职场', value: '职场' },
  ],
  documentary: [
    { label: '自然', value: '自然' },
    { label: '地理', value: '地理' },
    { label: '宇宙天文', value: '宇宙' },
    { label: '历史', value: '历史' },
    { label: '人文', value: '人文' },
    { label: '美食', value: '美食' },
    { label: '军事战争', value: '军事' },
    { label: '考古秘境', value: '考古' },
    { label: '科学', value: '科学' },
    { label: '探险', value: '探险' },
    { label: '动物生态', value: '动物' },
    { label: '社会纪实', value: '社会' },
    { label: '传记', value: '传记' },
    { label: '旅行', value: '旅行' },
    { label: '科技', value: '科技' },
    { label: '灾难', value: '灾难' },
    { label: '艺术', value: '艺术' },
  ],
  short: [
    { label: '战神', value: '战神' },
    { label: '豪门', value: '豪门' },
    { label: '赘婿', value: '赘婿' },
    { label: '复仇爽剧', value: '复仇' },
    { label: '虐恋', value: '虐恋' },
    { label: '重生', value: '重生' },
    { label: '穿越', value: '穿越' },
    { label: '逆袭', value: '逆袭' },
    { label: '神医', value: '神医' },
    { label: '甜宠', value: '甜宠' },
    { label: '言情', value: '言情' },
    { label: '古装', value: '古装' },
    { label: '仙侠', value: '仙侠' },
    { label: '脑洞', value: '脑洞' },
    { label: '现代都市', value: '现代都市' },
    { label: '女频', value: '女频' },
    { label: '萌宝', value: '萌宝' },
  ],
};

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
  const [selectedGenre, setSelectedGenre] = useState<string>('');
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
        genre: overrides?.genre !== undefined ? overrides.genre : selectedGenre,
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
      selectedGenre,
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
    // 切换专区时，如果当前选中的题材在新的专区不存在，则自动重置题材
    const newGenres = CHANNEL_GENRES[channelVal] || CHANNEL_GENRES.all || [];
    const keepGenre = newGenres.some(g => g.value === selectedGenre) ? selectedGenre : '';
    if (keepGenre !== selectedGenre) {
      setSelectedGenre(keepGenre);
    }
    notifyChange({ channel: channelVal, genre: keepGenre });
  };

  const handleGenreSelect = (genreVal: string) => {
    const nextVal = selectedGenre === genreVal ? '' : genreVal;
    setSelectedGenre(nextVal);
    notifyChange({ genre: nextVal });
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
    setSelectedGenre('');
    setSelectedRegion('');
    setSelectedLang('');
    setSelectedYear('');
    setSelectedQuality('');
    setSelectedStatus('');
    setSelectedSort('time_added');
    onFilterChange({
      channel: selectedChannel,
      genre: '',
      region: '',
      lang: '',
      year: '',
      quality: '',
      status: '',
      sort: 'time_added',
    });
  };

  const hasActiveFilters = Boolean(
    selectedGenre || selectedRegion || selectedLang || selectedYear || selectedQuality || selectedStatus || selectedSort !== 'time_added'
  );

  const currentGenres = CHANNEL_GENRES[selectedChannel] || CHANNEL_GENRES[defaultChannel] || CHANNEL_GENRES.all;

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

        {/* 行 1.5：全部类型 / 题材分类（随选中的板块智能动态联动） */}
        <div className="flex items-start gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => {
              setSelectedGenre('');
              notifyChange({ genre: '' });
            }}
            className={`px-3.5 py-1.5 rounded-[3px] text-sm shrink-0 cursor-pointer font-medium transition-all text-center min-w-[88px] ${
              !selectedGenre
                ? 'bg-[#00a8ff] text-white shadow-sm'
                : 'text-[#8899aa] hover:text-white hover:bg-white/5'
            }`}
          >
            全部类型
          </button>
          <div className="flex flex-wrap items-center gap-x-6 sm:gap-x-7 gap-y-2 flex-1 pt-1">
            {currentGenres.map((item) => {
              const isActive = selectedGenre === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => handleGenreSelect(item.value)}
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
