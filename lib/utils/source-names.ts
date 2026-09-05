export function getSourceName(sourceId: string): string {
  const sourceNames: Record<string, string> = {
    'jisu': '极速资源',
    'guangsu': '光速资源',
    'xinlang': '新浪资源',
    'wujin': '无尽资源',
    'baofeng': '暴风资源',
    'liangzi': '量子资源',
    'dytt': '电影天堂',
    'json1080': '1080JSON',
    'huya': '虎牙资源',
    'haitun': '海豚资源',
    'feifan': '非凡资源',
    'hongniu': '红牛资源',
    'ruyi': '如意资源',
    'zuida': '最大资源',
    'subo': '速博资源',
    'jinying': '金鹰点播',
    'youku': '优酷资源',
    'ikun': 'iKun资源',
    'lezi': '乐子资源',
    'zy360': '360资源',
    'modu': '魔都资源',
    'jingyu': '鲸鱼资源',
    'moduys': '魔都影视',
    'modu_dm': '魔都动漫',
    'tianya': '天涯资源',
    'baiduyun': '百度云资源',
    'baidu': '百度云资源',
    'wolong': '卧龙资源',
    'wangwang': '旺旺资源',
    'jiangyu': '鲸鱼资源',
    'sanliuling': '360资源',
    'haihua': '海豚资源',
    'suoni': '索尼资源',
    'shandian': '闪电资源',
    'kuaiche': '快车资源',
    'leba': '乐播资源',
  };
  return sourceNames[sourceId] || sourceId;
}

export const SOURCE_IDS = [
  'jisu', 'guangsu', 'xinlang', 'wujin', 'baofeng', 'liangzi',
  'dytt', 'json1080', 'huya', 'haitun', 'feifan', 'hongniu',
  'ruyi', 'zuida', 'subo', 'jinying', 'youku', 'ikun',
  'lezi', 'zy360', 'modu', 'jingyu', 'moduys', 'modu_dm'
];
