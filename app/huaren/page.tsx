'use client';

import React, { useState, Suspense, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { SearchForm } from '@/components/search/SearchForm';
import { SearchResults } from '@/components/home/SearchResults';
import { useHomePage } from '@/lib/hooks/useHomePage';
import { Play, ChevronRight, Flame } from 'lucide-react';

interface MediaCardItem {
    id: string;
    title: string;
    rawCover: string;
    tagBadge: string; // 右上角气泡徽章（如“剧情”、“喜剧”、“悬疑”、“Blu-ray”、“豆瓣热榜”）
    badgeColor: 'green' | 'orange' | 'blue' | 'purple' | 'red';
    desc: string;     // 卡片下方简短剧情介绍
    type: 'movie' | 'tv';
}

interface RankItem {
    rank: number;
    title: string;
    status: string;
    type: 'movie' | 'tv';
}

interface HuarenSectionData {
    id: string;
    sectionTitle: string;
    rankTitle: string;
    type: 'movie' | 'tv';
    categoryTags: string[];
    movies: MediaCardItem[];
    rankings: RankItem[];
}

// 统一图片安全代理方法（100% 杜绝黑屏与裂图）
function getSafeCoverUrl(rawUrl: string): string {
    if (!rawUrl) return '';
    if (rawUrl.startsWith('/api/')) return rawUrl;
    return `/api/img-proxy?url=${encodeURIComponent(rawUrl)}`;
}

// 1:1 Huaren.live 原版精选板块数据（电影 / 电视剧 / 动漫 / 综艺 / 短剧）
const HUAREN_SECTIONS: HuarenSectionData[] = [
    {
        id: 'movies',
        sectionTitle: '最新电影',
        rankTitle: '最新电影榜单',
        type: 'movie',
        categoryTags: ['奇幻科幻', '战争犯罪', '悬疑恐怖惊悚', '爱情喜剧剧情', '动作冒险灾难', '动画电影'],
        movies: [
            {
                id: 'm-1',
                title: '消暑胜地反击战',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2910730595.jpg',
                tagBadge: '喜剧',
                badgeColor: 'green',
                desc: '一个高度紧张的青少年发现自己...',
                type: 'movie',
            },
            {
                id: 'm-2',
                title: '狼域',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2909430595.jpg',
                tagBadge: '剧情',
                badgeColor: 'blue',
                desc: '特种部队深入狼域绝境反击...',
                type: 'movie',
            },
            {
                id: 'm-3',
                title: '痴心二人行',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2908730595.jpg',
                tagBadge: '爱情',
                badgeColor: 'green',
                desc: '在孟买，两个社交笨拙的干禧一...',
                type: 'movie',
            },
            {
                id: 'm-4',
                title: '聊斋，魅首诡案',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2907630595.jpg',
                tagBadge: '悬疑',
                badgeColor: 'orange',
                desc: '来自西域的舞姬阿离三年前惨死...',
                type: 'movie',
            },
            {
                id: 'm-5',
                title: '真实之物',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2906530595.jpg',
                tagBadge: '剧情',
                badgeColor: 'blue',
                desc: '在寻找心灵寄托的过程中，莱奥...',
                type: 'movie',
            },
            {
                id: 'm-6',
                title: '对我来说你已经死了',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2905430595.jpg',
                tagBadge: '恐怖',
                badgeColor: 'purple',
                desc: '这部电影聚焦一群即将离开家上大...',
                type: 'movie',
            },
            {
                id: 'm-7',
                title: '痴人唱颂',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2904330595.jpg',
                tagBadge: '剧情',
                badgeColor: 'green',
                desc: '在一个与世隔绝的村庄里，年轻...',
                type: 'movie',
            },
            {
                id: 'm-8',
                title: '罪火焦点',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2903230595.jpg',
                tagBadge: '犯罪',
                badgeColor: 'orange',
                desc: '故事设定于AI统治的近未来，一...',
                type: 'movie',
            },
            {
                id: 'm-9',
                title: '歪心狼对阵ACME',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2902130595.jpg',
                tagBadge: '喜剧',
                badgeColor: 'blue',
                desc: '歪心狼被Acme产品负了太多次...',
                type: 'movie',
            },
            {
                id: 'm-10',
                title: '哆啦A梦，新大雄的海底鬼岩城',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2901030595.jpg',
                tagBadge: '豆瓣热榜',
                badgeColor: 'orange',
                desc: '哆啦A梦 2026全新作电影『降...',
                type: 'movie',
            },
        ],
        rankings: [
            { rank: 1, title: '给阿嬷的情书', status: '已完结', type: 'movie' },
            { rank: 2, title: '夜王', status: '已完结', type: 'movie' },
            { rank: 3, title: '蜘蛛侠：崭新之日', status: '高清版', type: 'movie' },
            { rank: 4, title: '痴迷', status: '第1集', type: 'movie' },
            { rank: 5, title: '哪吒之魔童闹海', status: '第1集', type: 'movie' },
            { rank: 6, title: '疯狂动物城2', status: '已完结', type: 'movie' },
            { rank: 7, title: '飞驰人生3', status: '已完结', type: 'movie' },
            { rank: 8, title: '一路向西', status: '已完结', type: 'movie' },
            { rank: 9, title: '群体', status: '已完结', type: 'movie' },
            { rank: 10, title: '色戒', status: '已完结', type: 'movie' },
        ],
    },
    {
        id: 'tv-series',
        sectionTitle: '最新电视剧',
        rankTitle: '最新电视剧榜单',
        type: 'tv',
        categoryTags: ['国产剧', '港台剧', '日韩剧', '欧美剧', '古装悬疑', '都市言情'],
        movies: [
            {
                id: 't-1',
                title: '庆余年 第二季',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2908075726.jpg',
                tagBadge: '古装',
                badgeColor: 'orange',
                desc: '范闲率领使团回京，智斗深宫...',
                type: 'tv',
            },
            {
                id: 't-2',
                title: '繁花',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2901968835.jpg',
                tagBadge: '王家卫',
                badgeColor: 'green',
                desc: '九十年代黄河路风起云涌时代传奇...',
                type: 'tv',
            },
            {
                id: 't-3',
                title: '狂飙',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2886867595.jpg',
                tagBadge: '扫黑',
                badgeColor: 'blue',
                desc: '安欣与高启强长达二十年的正邪较量...',
                type: 'tv',
            },
            {
                id: 't-4',
                title: '三体',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2886470395.jpg',
                tagBadge: '科幻',
                badgeColor: 'purple',
                desc: '纳米科学家汪淼揭开三体文明危机...',
                type: 'tv',
            },
            {
                id: 't-5',
                title: '边水往事',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2911667595.jpg',
                tagBadge: '悬疑',
                badgeColor: 'orange',
                desc: '异域三边坡惊心动魄的生存冒险...',
                type: 'tv',
            },
            {
                id: 't-6',
                title: '长相思',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2896014495.jpg',
                tagBadge: '仙侠',
                badgeColor: 'green',
                desc: '大荒动荡下的儿女情长与家国天下...',
                type: 'tv',
            },
            {
                id: 't-7',
                title: '追风者',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2905634595.jpg',
                tagBadge: '谍战',
                badgeColor: 'blue',
                desc: '金融青年魏若来的信仰成长之路...',
                type: 'tv',
            },
            {
                id: 't-8',
                title: '漫长的季节',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2890667595.jpg',
                tagBadge: '神作',
                badgeColor: 'orange',
                desc: '东北小城跨越二十年的悬案真相...',
                type: 'tv',
            },
            {
                id: 't-9',
                title: '梦华录',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2870667595.jpg',
                tagBadge: '雅韵',
                badgeColor: 'green',
                desc: '赵盼儿汴京开茶坊自立自强的励志故事...',
                type: 'tv',
            },
            {
                id: 't-10',
                title: '雪中悍刀行',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2880667595.jpg',
                tagBadge: '武侠',
                badgeColor: 'blue',
                desc: '北椋世子徐凤年历经磨砺终成大器...',
                type: 'tv',
            },
        ],
        rankings: [
            { rank: 1, title: '庆余年 第二季', status: '36集全', type: 'tv' },
            { rank: 2, title: '边水往事', status: '21集全', type: 'tv' },
            { rank: 3, title: '繁花', status: '30集全', type: 'tv' },
            { rank: 4, title: '狂飙', status: '39集全', type: 'tv' },
            { rank: 5, title: '三体', status: '30集全', type: 'tv' },
            { rank: 6, title: '长相思 第二季', status: '23集全', type: 'tv' },
            { rank: 7, title: '追风者', status: '38集全', type: 'tv' },
            { rank: 8, title: '漫长的季节', status: '12集全', type: 'tv' },
            { rank: 9, title: '隐秘的角落', status: '12集全', type: 'tv' },
            { rank: 10, title: '无心法师', status: '已完结', type: 'tv' },
        ],
    },
    {
        id: 'anime-series',
        sectionTitle: '最新动漫',
        rankTitle: '最新动漫榜单',
        type: 'tv',
        categoryTags: ['国漫玄幻', '日漫热血', '异界修仙', '机甲动作', '科幻奇幻', '经典怀旧'],
        movies: [
            {
                id: 'a-1',
                title: '仙逆',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2898067595.jpg',
                tagBadge: '国漫',
                badgeColor: 'orange',
                desc: '王林踏上修真大道，杀伐果断...',
                type: 'tv',
            },
            {
                id: 'a-2',
                title: '完美世界',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2878067595.jpg',
                tagBadge: '玄幻',
                badgeColor: 'green',
                desc: '一粒尘可填海，一根草斩尽日月星辰...',
                type: 'tv',
            },
            {
                id: 'a-3',
                title: '凡人修仙传',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2868067595.jpg',
                tagBadge: '修仙',
                badgeColor: 'blue',
                desc: '普通的山村穷小子韩立修仙传奇...',
                type: 'tv',
            },
            {
                id: 'a-4',
                title: '遮天',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2888067595.jpg',
                tagBadge: '史诗',
                badgeColor: 'purple',
                desc: '九龙拉棺开启浩瀚星空仙路...',
                type: 'tv',
            },
            {
                id: 'a-5',
                title: '吞噬星空',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2858067595.jpg',
                tagBadge: '机甲',
                badgeColor: 'orange',
                desc: '罗峰突破基因桎梏成为宇宙强者...',
                type: 'tv',
            },
            {
                id: 'a-6',
                title: '斗罗大陆2绝世唐门',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2895067595.jpg',
                tagBadge: '魂师',
                badgeColor: 'green',
                desc: '霍雨浩觉醒灵眸与唐门新传奇...',
                type: 'tv',
            },
            {
                id: 'a-7',
                title: '武庚纪',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2893067595.jpg',
                tagBadge: '热血',
                badgeColor: 'blue',
                desc: '不屈人类反抗神权统治的壮烈史诗...',
                type: 'tv',
            },
            {
                id: 'a-8',
                title: '斗破苍穹 年番',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2892067595.jpg',
                tagBadge: '异火',
                badgeColor: 'orange',
                desc: '萧炎掌控多种异火威震斗气大陆...',
                type: 'tv',
            },
            {
                id: 'a-9',
                title: '一人之下',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2891067595.jpg',
                tagBadge: '异人',
                badgeColor: 'green',
                desc: '张楚岚与冯宝宝探寻甲申之乱真相...',
                type: 'tv',
            },
            {
                id: 'a-10',
                title: '狐妖小红娘',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2890067595.jpg',
                tagBadge: '恋爱',
                badgeColor: 'blue',
                desc: '前世情缘今生相续的转世续缘...',
                type: 'tv',
            },
        ],
        rankings: [
            { rank: 1, title: '仙逆', status: '更新中', type: 'tv' },
            { rank: 2, title: '完美世界', status: '更新中', type: 'tv' },
            { rank: 3, title: '凡人修仙传', status: '更新中', type: 'tv' },
            { rank: 4, title: '遮天', status: '更新中', type: 'tv' },
            { rank: 5, title: '斗罗大陆2绝世唐门', status: '更新中', type: 'tv' },
            { rank: 6, title: '吞噬星空', status: '更新中', type: 'tv' },
            { rank: 7, title: '斗破苍穹 年番', status: '更新中', type: 'tv' },
            { rank: 8, title: '武神主宰', status: '更新中', type: 'tv' },
            { rank: 9, title: '灵剑尊', status: '更新中', type: 'tv' },
            { rank: 10, title: '妖神记', status: '更新中', type: 'tv' },
        ],
    },
    {
        id: 'variety-series',
        sectionTitle: '最新综艺',
        rankTitle: '最新综艺榜单',
        type: 'tv',
        categoryTags: ['音乐竞技', '真人户外', '脱口搞笑', '推理破案', '生活慢综', '恋爱观察'],
        movies: [
            {
                id: 'v-1',
                title: '歌手2024',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2908067595.jpg',
                tagBadge: '现场直播',
                badgeColor: 'orange',
                desc: '国际化顶级唱将现场真唱对决...',
                type: 'tv',
            },
            {
                id: 'v-2',
                title: '奔跑吧 第十二季',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2907067595.jpg',
                tagBadge: '户外',
                badgeColor: 'green',
                desc: '跑男团热血集结开启爆笑旅程...',
                type: 'tv',
            },
            {
                id: 'v-3',
                title: '乘风2024',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2906067595.jpg',
                tagBadge: '女团',
                badgeColor: 'blue',
                desc: '三十位姐姐乘风破浪绽放女性魅力...',
                type: 'tv',
            },
            {
                id: 'v-4',
                title: '大侦探 第九季',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2903067595.jpg',
                tagBadge: '推理',
                badgeColor: 'purple',
                desc: '高能烧脑剧本杀与实景搜证...',
                type: 'tv',
            },
            {
                id: 'v-5',
                title: '极限挑战 第十季',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2905067595.jpg',
                tagBadge: '搞笑',
                badgeColor: 'orange',
                desc: '极限团城市探索与趣味挑战...',
                type: 'tv',
            },
            {
                id: 'v-6',
                title: '种地吧 第二季',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2904067595.jpg',
                tagBadge: '治愈',
                badgeColor: 'green',
                desc: '十个勤天少年躬耕土地的真实记录...',
                type: 'tv',
            },
            {
                id: 'v-7',
                title: '脱口秀和Ta的朋友们',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2912067595.jpg',
                tagBadge: '喜剧',
                badgeColor: 'blue',
                desc: '幽默段子解构当代生活压力...',
                type: 'tv',
            },
            {
                id: 'v-8',
                title: '喜人奇妙夜',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2911067595.jpg',
                tagBadge: '素描喜剧',
                badgeColor: 'orange',
                desc: '脑洞大开的 Sketch 爆笑短剧舞台...',
                type: 'tv',
            },
            {
                id: 'v-9',
                title: '王牌对王牌 第八季',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2902067595.jpg',
                tagBadge: '合家欢',
                badgeColor: 'green',
                desc: '王牌家族欢乐对决经典回忆杀...',
                type: 'tv',
            },
            {
                id: 'v-10',
                title: '你好，星期六',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2901067595.jpg',
                tagBadge: '周播',
                badgeColor: 'blue',
                desc: '何炅带领好六街好友开启周末狂欢...',
                type: 'tv',
            },
        ],
        rankings: [
            { rank: 1, title: '歌手2024', status: '已完结', type: 'tv' },
            { rank: 2, title: '喜人奇妙夜', status: '已完结', type: 'tv' },
            { rank: 3, title: '脱口秀和Ta的朋友们', status: '已完结', type: 'tv' },
            { rank: 4, title: '大侦探 第九季', status: '已完结', type: 'tv' },
            { rank: 5, title: '奔跑吧 第十二季', status: '已完结', type: 'tv' },
            { rank: 6, title: '乘风2024', status: '已完结', type: 'tv' },
            { rank: 7, title: '种地吧 第二季', status: '已完结', type: 'tv' },
            { rank: 8, title: '极限挑战 第十季', status: '已完结', type: 'tv' },
            { rank: 9, title: '你好，星期六', status: '更新中', type: 'tv' },
            { rank: 10, title: '王牌对王牌 第八季', status: '已完结', type: 'tv' },
        ],
    },
    {
        id: 'short-drama',
        sectionTitle: '最新短剧',
        rankTitle: '最新短剧榜单',
        type: 'tv',
        categoryTags: ['都市逆袭', '战神归来', '豪门甜宠', '穿越重生', '古装权谋', '悬疑烧脑'],
        movies: [
            {
                id: 's-1',
                title: '无双战神归来',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2912530595.jpg',
                tagBadge: '战神',
                badgeColor: 'orange',
                desc: '一代战神隐退都市，护妻狂魔...',
                type: 'tv',
            },
            {
                id: 's-2',
                title: '重生八零之首富人生',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2912430595.jpg',
                tagBadge: '重生',
                badgeColor: 'green',
                desc: '重回八零年代，靠先知先觉登顶首富...',
                type: 'tv',
            },
            {
                id: 's-3',
                title: '顾总，太太又惊艳全球了',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2912330595.jpg',
                tagBadge: '甜宠',
                badgeColor: 'blue',
                desc: '假千金掉马逆袭，总裁追妻火葬场...',
                type: 'tv',
            },
            {
                id: 's-4',
                title: '龙皇殿主',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2912230595.jpg',
                tagBadge: '逆袭',
                badgeColor: 'purple',
                desc: '十万龙皇将士听令，殿主归位...',
                type: 'tv',
            },
            {
                id: 's-5',
                title: '绝世天医',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2912130595.jpg',
                tagBadge: '神医',
                badgeColor: 'orange',
                desc: '一手金针起死回生，纵横都市...',
                type: 'tv',
            },
            {
                id: 's-6',
                title: '替嫁娇妻不可欺',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2911930595.jpg',
                tagBadge: '豪门',
                badgeColor: 'green',
                desc: '双面娇妻与装残大佬的极限拉扯...',
                type: 'tv',
            },
            {
                id: 's-7',
                title: '大唐第一纨绔',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2911830595.jpg',
                tagBadge: '历史',
                badgeColor: 'blue',
                desc: '穿越大唐开局醉卧长安，智斗权贵...',
                type: 'tv',
            },
            {
                id: 's-8',
                title: '真假千金的豪门对决',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2911730595.jpg',
                tagBadge: '爽剧',
                badgeColor: 'orange',
                desc: '顶尖科研大佬重回豪门打脸假千金...',
                type: 'tv',
            },
            {
                id: 's-9',
                title: '九品芝麻官之龙王令',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2911530595.jpg',
                tagBadge: '搞笑',
                badgeColor: 'green',
                desc: '小县令执掌龙王令，惩恶扬善...',
                type: 'tv',
            },
            {
                id: 's-10',
                title: '极品家丁之无敌赘婿',
                rawCover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2911430595.jpg',
                tagBadge: '赘婿',
                badgeColor: 'blue',
                desc: '赘婿翻身成首富，掌管天下商会...',
                type: 'tv',
            },
        ],
        rankings: [
            { rank: 1, title: '无双战神归来', status: '80集全', type: 'tv' },
            { rank: 2, title: '重生八零之首富人生', status: '90集全', type: 'tv' },
            { rank: 3, title: '顾总，太太又惊艳全球了', status: '85集全', type: 'tv' },
            { rank: 4, title: '龙皇殿主', status: '100集全', type: 'tv' },
            { rank: 5, title: '绝世天医', status: '95集全', type: 'tv' },
            { rank: 6, title: '替嫁娇妻不可欺', status: '88集全', type: 'tv' },
            { rank: 7, title: '大唐第一纨绔', status: '80集全', type: 'tv' },
            { rank: 8, title: '真假千金的豪门对决', status: '92集全', type: 'tv' },
            { rank: 9, title: '九品芝麻官之龙王令', status: '80集全', type: 'tv' },
            { rank: 10, title: '极品家丁之无敌赘婿', status: '100集全', type: 'tv' },
        ],
    },
];

function HuarenHome() {
    const router = useRouter();

    const {
        query,
        hasSearched,
        loading: searchLoading,
        results: searchResults,
        availableSources,
        handleSearch,
        handleReset,
    } = useHomePage();

    // 关键播放逻辑：传 title 和 type，由播放器并发调度 36 大影视专线直解秒播！
    const handlePlayVideo = useCallback((item: { title: string; type?: string }) => {
        if (!item.title) return;
        const cleanTitle = item.title.trim();
        const typeParam = item.type === 'movie' ? 'movie' : 'tv';
        router.push(`/player?title=${encodeURIComponent(cleanTitle)}&type=${typeParam}`);
    }, [router]);

    return (
        <div className="min-h-screen bg-[#14151B] text-white relative overflow-x-hidden selection:bg-rose-500 selection:text-white">
            {/* 顶部 Navbar */}
            <Navbar onReset={handleReset} />

            {/* 专属搜索栏 */}
            <div className="fluid-container mt-4 mb-6 relative z-30">
                <SearchForm
                    onSearch={handleSearch}
                    onClear={handleReset}
                    isLoading={searchLoading}
                />
            </div>

            <main className="fluid-container pb-24 space-y-12">
                {/* 搜索结果展示 */}
                {hasSearched ? (
                    <SearchResults
                        query={query}
                        loading={searchLoading}
                        results={searchResults}
                        availableSources={availableSources}
                    />
                ) : (
                    <>
                        {/* 1:1 Huaren.live 原版各大板块（左侧 2行x5列网格 + 右侧 Top 10 排行榜） */}
                        {HUAREN_SECTIONS.map((section) => (
                            <section key={section.id} className="space-y-4">
                                {/* 1. 板块 Header */}
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                    {/* 左侧大标题 + 更多 */}
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                                {section.sectionTitle}
                                            </h2>
                                            <button
                                                onClick={() => router.push(section.type === 'movie' ? '/movie' : '/tv')}
                                                className="text-xs text-white/50 hover:text-white flex items-center transition-colors cursor-pointer mt-0.5"
                                            >
                                                <span>更多</span>
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>

                                        {/* 横向胶囊分类筛选标签 */}
                                        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                                            {section.categoryTags.map((tag, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handlePlayVideo({ title: tag, type: section.type })}
                                                    className="px-3 py-1 rounded-full text-xs text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/10 border border-white/5 transition-all cursor-pointer shrink-0"
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 右侧榜单标题 (对应右侧侧边栏) */}
                                    <div className="hidden lg:block w-[280px] shrink-0">
                                        <h3 className="text-lg font-bold text-white tracking-tight">
                                            {section.rankTitle}
                                        </h3>
                                    </div>
                                </div>

                                {/* 2. 主内容区域：左侧 2x5 网格 + 右侧 Top 10 榜单 */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* 左侧：2 行 × 5 列 = 10 部卡片网格 (占 9 栏) */}
                                    <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                                        {section.movies.map((movie) => (
                                            <HuarenMovieCard
                                                key={movie.id}
                                                movie={movie}
                                                onClick={() => handlePlayVideo(movie)}
                                            />
                                        ))}
                                    </div>

                                    {/* 右侧：Top 10 排行榜卡片列表 (占 3 栏) */}
                                    <div className="lg:col-span-3 bg-[#1A1B22]/90 rounded-2xl border border-white/[0.06] p-4 flex flex-col justify-between shadow-xl">
                                        <h3 className="lg:hidden text-base font-bold text-white mb-3 pb-2 border-b border-white/10">
                                            {section.rankTitle}
                                        </h3>

                                        <div className="space-y-2.5">
                                            {section.rankings.map((item) => {
                                                const isTop1 = item.rank === 1;
                                                const isTop2 = item.rank === 2;
                                                const isTop3 = item.rank === 3;

                                                return (
                                                    <div
                                                        key={item.rank}
                                                        onClick={() => handlePlayVideo(item)}
                                                        className="group flex items-center justify-between p-1.5 rounded-xl hover:bg-white/[0.06] transition-all cursor-pointer"
                                                    >
                                                        {/* 排名与标题 */}
                                                        <div className="flex items-center gap-3 min-w-0 pr-2">
                                                            {/* 排名数字 (1~3 红色/橙色高光斜体) */}
                                                            <span className={`text-base font-black italic w-5 shrink-0 ${
                                                                isTop1 ? 'text-[#FF4D4F]' : isTop2 ? 'text-[#FA8C16]' : isTop3 ? 'text-[#FAAD14]' : 'text-white/30'
                                                            }`}>
                                                                {item.rank}
                                                            </span>

                                                            <div className="min-w-0">
                                                                <p className="text-xs sm:text-sm font-bold text-white/90 group-hover:text-rose-400 truncate transition-colors">
                                                                    {item.title}
                                                                </p>
                                                                <p className="text-[10px] text-white/40">
                                                                    {item.status}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* 右侧热度火焰 🔥🔥🔥🔥🔥 */}
                                                        <div className="flex items-center gap-0.5 text-amber-500 text-xs shrink-0">
                                                            <Flame size={12} className="fill-amber-500 text-amber-500" />
                                                            <Flame size={12} className="fill-amber-500 text-amber-500" />
                                                            <Flame size={12} className="fill-amber-500 text-amber-500" />
                                                            <Flame size={12} className="fill-amber-500 text-amber-500" />
                                                            <Flame size={12} className="fill-amber-500 text-amber-500" />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        ))}
                    </>
                )}
            </main>
        </div>
    );
}

// 1:1 Huaren.live 原版竖版电影卡片组件
function HuarenMovieCard({
    movie,
    onClick,
}: {
    movie: MediaCardItem;
    onClick: () => void;
}) {
    const [imgError, setImgError] = useState(false);
    const coverUrl = getSafeCoverUrl(movie.rawCover);

    // 徽章颜色映射
    const badgeColorStyle = {
        green: 'bg-[#10B981] text-white',
        orange: 'bg-[#F59E0B] text-black font-black',
        blue: 'bg-[#3B82F6] text-white',
        purple: 'bg-[#8B5CF6] text-white',
        red: 'bg-[#EF4444] text-white',
    }[movie.badgeColor || 'green'];

    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col cursor-pointer select-none transition-transform duration-300 hover:-translate-y-1.5"
        >
            {/* 封面区域 (3:4 或 2:3 比例，圆角 16px) */}
            <div className="relative aspect-[3/4] w-full rounded-2xl bg-[#1C1D24] overflow-hidden shadow-lg border border-white/[0.04] group-hover:border-white/20 transition-all">
                {!imgError && coverUrl ? (
                    <Image
                        src={coverUrl}
                        alt={movie.title}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
                        className="object-cover object-center scale-100 group-hover:scale-106 transition-transform duration-700 ease-out"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-black flex flex-col items-center justify-center p-3 text-center">
                        <span className="text-xs font-bold text-white/80 line-clamp-2">{movie.title}</span>
                    </div>
                )}

                {/* 悬停微暗影 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 opacity-60 group-hover:opacity-30 transition-opacity" />

                {/* 右上角气泡角标 (如“剧情”、“喜剧”、“悬疑”) */}
                {movie.tagBadge && (
                    <div className={`absolute top-2 right-2 z-20 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md ${badgeColorStyle}`}>
                        {movie.tagBadge}
                    </div>
                )}

                {/* 悬停居中浮现播放图标 */}
                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-xl scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play size={20} className="fill-white ml-0.5" />
                    </div>
                </div>
            </div>

            {/* 标题与副标题 */}
            <div className="pt-2.5 space-y-0.5 px-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-white/95 group-hover:text-rose-400 line-clamp-1 transition-colors">
                    {movie.title}
                </h4>
                <p className="text-[11px] text-white/40 line-clamp-1">
                    {movie.desc}
                </p>
            </div>
        </div>
    );
}

export default function HuarenPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#14151B]">
                <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
            </div>
        }>
            <HuarenHome />
        </Suspense>
    );
}
