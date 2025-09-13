import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, User, Receipt, ChevronDown } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

// 組織類型資料
const organizationTypes = [
  { id: 'company', name: '公司' },
  { id: 'religious', name: '宗教團體' },
  { id: 'school', name: '學校' },
  { id: 'foundation', name: '基金會/協會' },
  { id: 'other', name: '其他' },
];

// 台灣縣市資料
const taiwanCities = [
  { id: 'taipei', name: '台北市' },
  { id: 'new-taipei', name: '新北市' },
  { id: 'taoyuan', name: '桃園市' },
  { id: 'taichung', name: '台中市' },
  { id: 'tainan', name: '台南市' },
  { id: 'kaohsiung', name: '高雄市' },
  { id: 'keelung', name: '基隆市' },
  { id: 'hsinchu-city', name: '新竹市' },
  { id: 'chiayi-city', name: '嘉義市' },
  { id: 'hsinchu', name: '新竹縣' },
  { id: 'miaoli', name: '苗栗縣' },
  { id: 'changhua', name: '彰化縣' },
  { id: 'nantou', name: '南投縣' },
  { id: 'yunlin', name: '雲林縣' },
  { id: 'chiayi', name: '嘉義縣' },
  { id: 'pingtung', name: '屏東縣' },
  { id: 'yilan', name: '宜蘭縣' },
  { id: 'hualien', name: '花蓮縣' },
  { id: 'taitung', name: '台東縣' },
  { id: 'penghu', name: '澎湖縣' },
  { id: 'kinmen', name: '金門縣' },
  { id: 'lienchiang', name: '連江縣' },
];

// 鄉鎮市區資料
const districts: Record<string, { id: string; name: string }[]> = {
  'taipei': [
    { id: 'zhongzheng', name: '中正區' },
    { id: 'datong', name: '大同區' },
    { id: 'zhongshan', name: '中山區' },
    { id: 'songshan', name: '松山區' },
    { id: 'daan', name: '大安區' },
    { id: 'wanhua', name: '萬華區' },
    { id: 'xinyi', name: '信義區' },
    { id: 'shilin', name: '士林區' },
    { id: 'beitou', name: '北投區' },
    { id: 'neihu', name: '內湖區' },
    { id: 'nangang', name: '南港區' },
    { id: 'wenshan', name: '文山區' },
  ],
  'new-taipei': [
    { id: 'banqiao', name: '板橋區' },
    { id: 'sanchong', name: '三重區' },
    { id: 'zhonghe', name: '中和區' },
    { id: 'yonghe', name: '永和區' },
    { id: 'xinzhuang', name: '新莊區' },
    { id: 'xindian', name: '新店區' },
    { id: 'tucheng', name: '土城區' },
    { id: 'luzhou', name: '蘆洲區' },
    { id: 'shulin', name: '樹林區' },
    { id: 'yingge', name: '鶯歌區' },
    { id: 'sanxia', name: '三峽區' },
    { id: 'tamsui', name: '淡水區' },
  ],
  'taoyuan': [
    { id: 'taoyuan', name: '桃園區' },
    { id: 'zhongli', name: '中壢區' },
    { id: 'pingzhen', name: '平鎮區' },
    { id: 'yangmei', name: '楊梅區' },
    { id: 'luzhu', name: '蘆竹區' },
    { id: 'daxi', name: '大溪區' },
    { id: 'longtan', name: '龍潭區' },
    { id: 'xinwu', name: '新屋區' },
    { id: 'guanyin', name: '觀音區' },
    { id: 'dayuan', name: '大園區' },
    { id: 'fuxing', name: '復興區' },
    { id: 'guishan', name: '龜山區' },
  ],
  'taichung': [
    { id: 'central', name: '中區' },
    { id: 'east', name: '東區' },
    { id: 'south', name: '南區' },
    { id: 'west', name: '西區' },
    { id: 'north', name: '北區' },
    { id: 'nantun', name: '南屯區' },
    { id: 'xitun', name: '西屯區' },
    { id: 'beitun', name: '北屯區' },
    { id: 'fengyuan', name: '豐原區' },
    { id: 'dongshi', name: '東勢區' },
    { id: 'daya', name: '大雅區' },
    { id: 'tanzi', name: '潭子區' },
    { id: 'shalu', name: '沙鹿區' },
    { id: 'qingshui', name: '清水區' },
    { id: 'wuqi', name: '梧棲區' },
    { id: 'dadu', name: '大肚區' },
    { id: 'longjing', name: '龍井區' },
    { id: 'wufeng', name: '烏日區' },
    { id: 'taiping', name: '太平區' },
    { id: 'dali', name: '大里區' },
    { id: 'wuri', name: '烏日區' },
    { id: 'wufeng-tc', name: '霧峰區' },
  ],
  'tainan': [
    { id: 'central-west', name: '中西區' },
    { id: 'east', name: '東區' },
    { id: 'south', name: '南區' },
    { id: 'north', name: '北區' },
    { id: 'annan', name: '安南區' },
    { id: 'anping', name: '安平區' },
    { id: 'yongkang', name: '永康區' },
    { id: 'guiren', name: '歸仁區' },
    { id: 'xinhua', name: '新化區' },
    { id: 'zuozhen', name: '左鎮區' },
    { id: 'yujing', name: '玉井區' },
    { id: 'nanxi', name: '楠西區' },
    { id: 'nanhua', name: '南化區' },
    { id: 'rende', name: '仁德區' },
    { id: 'guanmiao', name: '關廟區' },
    { id: 'longqi', name: '龍崎區' },
    { id: 'guantian', name: '官田區' },
    { id: 'madou', name: '麻豆區' },
    { id: 'jiali', name: '佳里區' },
    { id: 'xigang', name: '西港區' },
    { id: 'qigu', name: '七股區' },
    { id: 'jiangjun', name: '將軍區' },
    { id: 'beimen', name: '北門區' },
    { id: 'xinying', name: '新營區' },
    { id: 'houbi', name: '後壁區' },
    { id: 'baihe', name: '白河區' },
    { id: 'dongshan', name: '東山區' },
    { id: 'liuying', name: '柳營區' },
    { id: 'yansui', name: '鹽水區' },
    { id: 'shanhua', name: '善化區' },
    { id: 'danei', name: '大內區' },
    { id: 'shanshang', name: '山上區' },
    { id: 'xinshi', name: '新市區' },
    { id: 'anding', name: '安定區' },
    { id: 'xuejia', name: '學甲區' },
  ],
  'kaohsiung': [
    { id: 'xinxing', name: '新興區' },
    { id: 'qianjin', name: '前金區' },
    { id: 'lingya', name: '苓雅區' },
    { id: 'yancheng', name: '鹽埕區' },
    { id: 'gushan', name: '鼓山區' },
    { id: 'qijin', name: '旗津區' },
    { id: 'qianzhen', name: '前鎮區' },
    { id: 'sanmin', name: '三民區' },
    { id: 'nanzi', name: '楠梓區' },
    { id: 'zuoying', name: '左營區' },
    { id: 'renwu', name: '仁武區' },
    { id: 'dashe', name: '大社區' },
    { id: 'gangshan', name: '岡山區' },
    { id: 'luzhu', name: '路竹區' },
    { id: 'alian', name: '阿蓮區' },
    { id: 'tianshi', name: '田寮區' },
    { id: 'yanpu', name: '燕巢區' },
    { id: 'qiaotou', name: '橋頭區' },
    { id: 'ziguan', name: '梓官區' },
    { id: 'mituo', name: '彌陀區' },
    { id: 'yong-an', name: '永安區' },
    { id: 'hunei', name: '湖內區' },
    { id: 'fengshan', name: '鳳山區' },
    { id: 'daliao', name: '大寮區' },
    { id: 'linyuan', name: '林園區' },
    { id: 'niaosong', name: '鳥松區' },
    { id: 'dashu', name: '大樹區' },
    { id: 'qishan', name: '旗山區' },
    { id: 'meinong', name: '美濃區' },
    { id: 'liugui', name: '六龜區' },
    { id: 'neimen', name: '內門區' },
    { id: 'shanlin', name: '杉林區' },
    { id: 'jiaxian', name: '甲仙區' },
    { id: 'taoyuan-kh', name: '桃源區' },
    { id: 'namaxia', name: '那瑪夏區' },
    { id: 'maolin', name: '茂林區' },
  ],
  'keelung': [
    { id: 'ren-ai', name: '仁愛區' },
    { id: 'xinyi', name: '信義區' },
    { id: 'zhongzheng', name: '中正區' },
    { id: 'zhongshan', name: '中山區' },
    { id: 'anle', name: '安樂區' },
    { id: 'nuan-nuan', name: '暖暖區' },
    { id: 'qidu', name: '七堵區' },
  ],
  'hsinchu-city': [
    { id: 'east', name: '東區' },
    { id: 'north', name: '北區' },
    { id: 'xiangshan', name: '香山區' },
  ],
  'chiayi-city': [
    { id: 'east', name: '東區' },
    { id: 'west', name: '西區' },
  ],
  'hsinchu': [
    { id: 'zhubei', name: '竹北市' },
    { id: 'hukou', name: '湖口鄉' },
    { id: 'xinpu', name: '新埔鎮' },
    { id: 'guanxi', name: '關西鎮' },
    { id: 'qionglin', name: '芎林鄉' },
    { id: 'baoshan', name: '寶山鄉' },
    { id: 'zhudong', name: '竹東鎮' },
    { id: 'wufeng', name: '五峰鄉' },
    { id: 'hengshan', name: '橫山鄉' },
    { id: 'jianshi', name: '尖石鄉' },
    { id: 'beipu', name: '北埔鄉' },
    { id: 'emei', name: '峨眉鄉' },
  ],
  'miaoli': [
    { id: 'miaoli-city', name: '苗栗市' },
    { id: 'yuanli', name: '苑裡鎮' },
    { id: 'tongxiao', name: '通霄鎮' },
    { id: 'zhunan', name: '竹南鎮' },
    { id: 'toufen', name: '頭份市' },
    { id: 'houlong', name: '後龍鎮' },
    { id: 'zaoqiao', name: '造橋鄉' },
    { id: 'xihu', name: '西湖鄉' },
    { id: 'tongluo', name: '銅鑼鄉' },
    { id: 'sanyi', name: '三義鄉' },
    { id: 'xianzhuhu', name: '西湖鄉' },
    { id: 'touwu', name: '頭屋鄉' },
    { id: 'gongguang', name: '公館鄉' },
    { id: 'dahu', name: '大湖鄉' },
    { id: 'tai-an', name: '泰安鄉' },
    { id: 'nan-zhuang', name: '南庄鄉' },
    { id: 'shitan', name: '獅潭鄉' },
  ],
  'changhua': [
    { id: 'changhua-city', name: '彰化市' },
    { id: 'yuanlin', name: '員林市' },
    { id: 'hemei', name: '和美鎮' },
    { id: 'lukang', name: '鹿港鎮' },
    { id: 'xishui', name: '溪湖鎮' },
    { id: 'tianzhong', name: '田中鎮' },
    { id: 'dacun', name: '大村鄉' },
    { id: 'puyan', name: '埔鹽鄉' },
    { id: 'pusin', name: '埔心鄉' },
    { id: 'yongjing', name: '永靖鄉' },
    { id: 'shetou', name: '社頭鄉' },
    { id: 'ershui', name: '二水鄉' },
    { id: 'beidou', name: '北斗鎮' },
    { id: 'ershin', name: '二林鎮' },
    { id: 'tianwei', name: '田尾鄉' },
    { id: 'pitou', name: '埤頭鄉' },
    { id: 'fangyuan', name: '芳苑鄉' },
    { id: 'dacheng', name: '大城鄉' },
    { id: 'zhutang', name: '竹塘鄉' },
    { id: 'xizhou', name: '溪州鄉' },
    { id: 'huatan', name: '花壇鄉' },
    { id: 'xinshi', name: '新市鄉' },
    { id: 'fuxing', name: '福興鄉' },
    { id: 'xiushui', name: '秀水鄉' },
    { id: 'fenyuan', name: '芬園鄉' },
    { id: 'linsha', name: '線西鄉' },
  ],
  'nantou': [
    { id: 'nantou-city', name: '南投市' },
    { id: 'puli', name: '埔里鎮' },
    { id: 'caotun', name: '草屯鎮' },
    { id: 'zhushan', name: '竹山鎮' },
    { id: 'jiji', name: '集集鎮' },
    { id: 'mingjian', name: '名間鄉' },
    { id: 'lugu', name: '鹿谷鄉' },
    { id: 'zhongliao', name: '中寮鄉' },
    { id: 'yuchi', name: '魚池鄉' },
    { id: 'guoxing', name: '國姓鄉' },
    { id: 'shuili', name: '水里鄉' },
    { id: 'xinyi-nt', name: '信義鄉' },
    { id: 'ren-ai', name: '仁愛鄉' },
  ],
  'yunlin': [
    { id: 'douliu', name: '斗六市' },
    { id: 'dounan', name: '斗南鎮' },
    { id: 'huwei', name: '虎尾鎮' },
    { id: 'xiluo', name: '西螺鎮' },
    { id: 'tulku', name: '土庫鎮' },
    { id: 'beigang', name: '北港鎮' },
    { id: 'gukeng', name: '古坑鄉' },
    { id: 'datong', name: '大埤鄉' },
    { id: 'yunnei', name: '莿桐鄉' },
    { id: 'linnei', name: '林內鄉' },
    { id: 'erlun', name: '二崙鄉' },
    { id: 'lunnei', name: '崙背鄉' },
    { id: 'mailiao', name: '麥寮鄉' },
    { id: 'dongshi-yl', name: '東勢鄉' },
    { id: 'baozhong', name: '褒忠鄉' },
    { id: 'taixi', name: '台西鄉' },
    { id: 'yuanchang', name: '元長鄉' },
    { id: 'sihu', name: '四湖鄉' },
    { id: 'kohu', name: '口湖鄉' },
    { id: 'shuibing', name: '水林鄉' },
  ],
  'chiayi': [
    { id: 'taibao', name: '太保市' },
    { id: 'puzi', name: '朴子市' },
    { id: 'budai', name: '布袋鎮' },
    { id: 'dalin', name: '大林鎮' },
    { id: 'minxiong', name: '民雄鄉' },
    { id: 'xikou', name: '溪口鄉' },
    { id: 'xingang', name: '新港鄉' },
    { id: 'liujiao', name: '六腳鄉' },
    { id: 'dongshi-cy', name: '東石鄉' },
    { id: 'yizhu', name: '義竹鄉' },
    { id: 'luku', name: '鹿草鄉' },
    { id: 'shuishang', name: '水上鄉' },
    { id: 'zhongpu', name: '中埔鄉' },
    { id: 'zhuqi', name: '竹崎鄉' },
    { id: 'meishan', name: '梅山鄉' },
    { id: 'fanlu', name: '番路鄉' },
    { id: 'dapu', name: '大埔鄉' },
    { id: 'alishan', name: '阿里山鄉' },
  ],
  'pingtung': [
    { id: 'pingtung-city', name: '屏東市' },
    { id: 'chaozhou', name: '潮州鎮' },
    { id: 'donggang', name: '東港鎮' },
    { id: 'hengchun', name: '恆春鎮' },
    { id: 'wandan', name: '萬丹鄉' },
    { id: 'changzhi', name: '長治鄉' },
    { id: 'jiuru', name: '九如鄉' },
    { id: 'ligang', name: '里港鄉' },
    { id: 'yanpu-pt', name: '鹽埔鄉' },
    { id: 'gaoshu', name: '高樹鄉' },
    { id: 'wanluan', name: '萬巒鄉' },
    { id: 'neipu', name: '內埔鄉' },
    { id: 'jiadong', name: '佳冬鄉' },
    { id: 'xinpi', name: '新埤鄉' },
    { id: 'fangliao', name: '枋寮鄉' },
    { id: 'fangshan', name: '枋山鄉' },
    { id: 'taiwu', name: '泰武鄉' },
    { id: 'laiyi', name: '來義鄉' },
    { id: 'chunri', name: '春日鄉' },
    { id: 'shizi', name: '獅子鄉' },
    { id: 'checheng', name: '車城鄉' },
    { id: 'mudan', name: '牡丹鄉' },
    { id: 'hengchun', name: '恆春鎮' },
    { id: 'manjhou', name: '滿州鄉' },
    { id: 'sandimen', name: '三地門鄉' },
    { id: 'wutai', name: '霧台鄉' },
    { id: 'majia', name: '瑪家鄉' },
    { id: 'liuqiu', name: '琉球鄉' },
    { id: 'linyuan-pt', name: '林邊鄉' },
    { id: 'nanzhou', name: '南州鄉' },
    { id: 'dongshi-pt', name: '東石鄉' },
    { id: 'zhutian', name: '竹田鄉' },
    { id: 'xinzhou', name: '新州鄉' },
  ],
  'yilan': [
    { id: 'yilan-city', name: '宜蘭市' },
    { id: 'jiaoxi', name: '礁溪鄉' },
    { id: 'zhuangwei', name: '壯圍鄉' },
    { id: 'yuanshan', name: '員山鄉' },
    { id: 'luodong', name: '羅東鎮' },
    { id: 'sanxing', name: '三星鄉' },
    { id: 'datong-yl', name: '大同鄉' },
    { id: 'wujie', name: '五結鄉' },
    { id: 'dongshan-yl', name: '冬山鄉' },
    { id: 'suao', name: '蘇澳鎮' },
    { id: 'nan-ao', name: '南澳鄉' },
    { id: 'toucheng', name: '頭城鎮' },
  ],
  'hualien': [
    { id: 'hualien-city', name: '花蓮市' },
    { id: 'xincheng', name: '新城鄉' },
    { id: 'xiulin', name: '秀林鄉' },
    { id: 'jian', name: '吉安鄉' },
    { id: 'shoufeng', name: '壽豐鄉' },
    { id: 'fenglin', name: '鳳林鎮' },
    { id: 'guangfu', name: '光復鄉' },
    { id: 'ruisui', name: '瑞穗鄉' },
    { id: 'wanrong', name: '萬榮鄉' },
    { id: 'yuli', name: '玉里鎮' },
    { id: 'zhuoxi', name: '卓溪鄉' },
    { id: 'fuli', name: '富里鄉' },
    { id: 'fengbin', name: '豐濱鄉' },
  ],
  'taitung': [
    { id: 'taitung-city', name: '台東市' },
    { id: 'chenggong', name: '成功鎮' },
    { id: 'guanshan', name: '關山鎮' },
    { id: 'beinan', name: '卑南鄉' },
    { id: 'luye', name: '鹿野鄉' },
    { id: 'chishang', name: '池上鄉' },
    { id: 'donghe', name: '東河鄉' },
    { id: 'changbin', name: '長濱鄉' },
    { id: 'taimali', name: '太麻里鄉' },
    { id: 'jinfeng', name: '金峰鄉' },
    { id: 'dawu', name: '大武鄉' },
    { id: 'daren', name: '達仁鄉' },
    { id: 'haiduan', name: '海端鄉' },
    { id: 'yanping', name: '延平鄉' },
    { id: 'green-island', name: '綠島鄉' },
    { id: 'lanyu', name: '蘭嶼鄉' },
  ],
  'penghu': [
    { id: 'magong', name: '馬公市' },
    { id: 'huxi', name: '湖西鄉' },
    { id: 'baisha', name: '白沙鄉' },
    { id: 'xiyu', name: '西嶼鄉' },
    { id: 'wangan', name: '望安鄉' },
    { id: 'qimei', name: '七美鄉' },
  ],
  'kinmen': [
    { id: 'jincheng', name: '金城鎮' },
    { id: 'jinsha', name: '金沙鎮' },
    { id: 'jinhu', name: '金湖鎮' },
    { id: 'jinning', name: '金寧鄉' },
    { id: 'lieyu', name: '烈嶼鄉' },
    { id: 'wuqiu', name: '烏坵鄉' },
  ],
  'lienchiang': [
    { id: 'nangan', name: '南竿鄉' },
    { id: 'beigan', name: '北竿鄉' },
    { id: 'juguang', name: '莒光鄉' },
    { id: 'dongyin', name: '東引鄉' },
  ],
};

export default function DonationInfoScreen() {
  const router = useRouter();
  
  // 表單狀態
  const [formData, setFormData] = useState({
    // 捐款類型
    donationType: 'personal', // 'personal' 或 'company'
    // 捐款人基本資料
    name: '',
    email: '',
    phone: '',
    city: '',
    district: '',
    street: '',
    birthday: '',
    // 公司/機構基本資料
    companyName: '',
    organizationType: '', // 組織類型: 'company', 'religious', 'school', 'foundation', 'other'
    companyPhone: '', // 公司電話
    taxId: '', // 統一編號
    companyCity: '', // 公司通訊地址縣市
    companyDistrict: '', // 公司通訊地址鄉鎮市區
    companyStreet: '', // 公司通訊地址街道門牌
    // 聯絡人資料
    contactName: '', // 聯絡人姓名
    contactTitle: '', // 聯絡人職稱
    contactEmail: '', // 聯絡人電子信箱
    contactPhone: '', // 聯絡人手機號碼
    // 收據資訊
    receiptDeliveryMethod: '', // 收據寄發方式: 'tax_upload', 'no_receipt', 'mail'（寄送紙本）
    receiptTitle: '', // 收據抬頭
    receiptTaxId: '', // 收據統一編號（公司用）
    receiptAddress: '', // 收據地址
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showCityModal, setShowCityModal] = useState(false);
  const [showDistrictModal, setShowDistrictModal] = useState(false);
  const [showCompanyCityModal, setShowCompanyCityModal] = useState(false);
  const [showCompanyDistrictModal, setShowCompanyDistrictModal] = useState(false);
  const [showOrgTypeModal, setShowOrgTypeModal] = useState(false);

  const triggerHapticFeedback = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // 暫時跳過所有驗證，允許空白表單提交
    // TODO: 之後根據需求重新啟用驗證邏輯
    
    setErrors(newErrors);
    return true; // 總是返回 true，允許提交
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // 當改變捐款類型時，重置相關欄位
      if (field === 'donationType') {
        newData.receiptDeliveryMethod = '';
        newData.receiptTitle = '';
        newData.receiptTaxId = '';
        newData.name = '';
        newData.birthday = '';
        newData.email = '';
        newData.phone = '';
        newData.city = '';
        newData.district = '';
        newData.street = '';
        newData.companyName = '';
        newData.organizationType = '';
        newData.companyPhone = '';
        newData.taxId = '';
        newData.companyCity = '';
        newData.companyDistrict = '';
        newData.companyStreet = '';
        newData.contactName = '';
        newData.contactTitle = '';
        newData.contactEmail = '';
        newData.contactPhone = '';
        newData.receiptAddress = '';
      }
      
      return newData;
    });
    
    // 清除該欄位的錯誤訊息
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // 當改變捐款類型時，也清除相關錯誤訊息
    if (field === 'donationType') {
      setErrors({});
    }
  };

  const handleAutoFillReceiptTitle = () => {
    if (formData.donationType === 'personal') {
      if (formData.name.trim()) {
        setFormData(prev => ({ ...prev, receiptTitle: formData.name }));
        // 清除錯誤訊息
        if (errors.receiptTitle) {
          setErrors(prev => ({ ...prev, receiptTitle: '' }));
        }
        triggerHapticFeedback();
      } else {
        Alert.alert('提醒', '請先填寫捐款人姓名');
      }
    } else {
      if (formData.companyName.trim()) {
        setFormData(prev => ({ ...prev, receiptTitle: formData.companyName }));
        // 清除錯誤訊息
        if (errors.receiptTitle) {
          setErrors(prev => ({ ...prev, receiptTitle: '' }));
        }
        triggerHapticFeedback();
      } else {
        Alert.alert('提醒', '請先填寫公司/機構名稱');
      }
    }
  };

  const handleCitySelect = (cityId: string, cityName: string) => {
    setFormData(prev => ({ 
      ...prev, 
      city: cityId,
      district: '', // 重置鄉鎮市區選擇
    }));
    // 清除相關錯誤訊息
    setErrors(prev => ({ ...prev, city: '', district: '' }));
    setShowCityModal(false);
    triggerHapticFeedback();
  };

  const handleDistrictSelect = (districtId: string, districtName: string) => {
    setFormData(prev => ({ ...prev, district: districtId }));
    // 清除錯誤訊息
    setErrors(prev => ({ ...prev, district: '' }));
    setShowDistrictModal(false);
    triggerHapticFeedback();
  };

  const handleOrgTypeSelect = (orgTypeId: string, orgTypeName: string) => {
    setFormData(prev => ({ ...prev, organizationType: orgTypeId }));
    // 清除錯誤訊息
    setErrors(prev => ({ ...prev, organizationType: '' }));
    setShowOrgTypeModal(false);
    triggerHapticFeedback();
  };

  const handleCompanyCitySelect = (cityId: string, cityName: string) => {
    setFormData(prev => ({ 
      ...prev, 
      companyCity: cityId,
      companyDistrict: '', // 重置鄉鎮市區選擇
    }));
    // 清除相關錯誤訊息
    setErrors(prev => ({ ...prev, companyCity: '', companyDistrict: '' }));
    setShowCompanyCityModal(false);
    triggerHapticFeedback();
  };

  const handleCompanyDistrictSelect = (districtId: string, districtName: string) => {
    setFormData(prev => ({ ...prev, companyDistrict: districtId }));
    // 清除錯誤訊息
    setErrors(prev => ({ ...prev, companyDistrict: '' }));
    setShowCompanyDistrictModal(false);
    triggerHapticFeedback();
  };

  const getCityName = (cityId: string) => {
    return taiwanCities.find(city => city.id === cityId)?.name || '請選擇縣市';
  };

  const getDistrictName = (districtId: string) => {
    if (!formData.city) return '請先選擇縣市';
    const cityDistricts = districts[formData.city] || [];
    return cityDistricts.find(district => district.id === districtId)?.name || '請選擇鄉鎮市區';
  };

  const getOrgTypeName = (orgTypeId: string) => {
    return organizationTypes.find(type => type.id === orgTypeId)?.name || '請選擇組織類型';
  };

  const getCompanyCityName = (cityId: string) => {
    return taiwanCities.find(city => city.id === cityId)?.name || '請選擇縣市';
  };

  const getCompanyDistrictName = (districtId: string) => {
    if (!formData.companyCity) return '請先選擇縣市';
    const cityDistricts = districts[formData.companyCity] || [];
    return cityDistricts.find(district => district.id === districtId)?.name || '請選擇鄉鎮市區';
  };

  const handleSubmit = () => {
    triggerHapticFeedback();
    
    if (!validateForm()) {
      Alert.alert('填寫不完整', '請檢查並填寫所有必填欄位');
      return;
    }
    
    // 這裡可以加入實際的提交邏輯
    // 顯示成功提示並自動跳轉
    Alert.alert(
      '資料提交成功',
      '您的捐款資訊已成功提交，我們會盡快處理。'
    );
    
    // 2秒後自動返回投餵成功頁面
    setTimeout(() => {
      router.back();
    }, 2000);
  };

  const handleBack = () => {
    triggerHapticFeedback();
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FEFDFB" />
      
      {/* 標題列 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
        >
          <ChevronLeft size={24} color="#1C1917" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>填寫捐款資訊</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 捐款類型選擇 */}
        <View style={styles.donationTypeSection}>
          <Text style={styles.donationTypeTitle}>選擇捐款類型</Text>
          <View style={styles.donationTypeButtons}>
            <TouchableOpacity
              style={[
                styles.donationTypeButton,
                formData.donationType === 'personal' && styles.donationTypeButtonActive
              ]}
              onPress={() => handleInputChange('donationType', 'personal')}
            >
              <Text style={[
                styles.donationTypeButtonText,
                formData.donationType === 'personal' && styles.donationTypeButtonTextActive
              ]}>
                個人捐款
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.donationTypeButton,
                formData.donationType === 'company' && styles.donationTypeButtonActive
              ]}
              onPress={() => handleInputChange('donationType', 'company')}
            >
              <Text style={[
                styles.donationTypeButtonText,
                formData.donationType === 'company' && styles.donationTypeButtonTextActive
              ]}>
                公司/機構捐款
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 捐款人基本資料 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color="#F97316" strokeWidth={2} />
            <Text style={styles.sectionTitle}>
              {formData.donationType === 'personal' ? '捐款人基本資料' : '公司/機構資料'}
            </Text>
          </View>
          
          {formData.donationType === 'personal' ? (
            <>
              {/* 個人基本資料 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>姓名 *</Text>
                <TextInput
                  style={[styles.textInput, errors.name && styles.inputError]}
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholder="請輸入您的姓名"
                  placeholderTextColor="#A3A3A3"
                />
                {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
              </View>

              {/* 生日 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>生日 *</Text>
                <TextInput
                  style={[styles.textInput, errors.birthday && styles.inputError]}
                  value={formData.birthday}
                  onChangeText={(value) => handleInputChange('birthday', value)}
                  placeholder="YYYY/MM/DD"
                  placeholderTextColor="#A3A3A3"
                />
                {errors.birthday && <Text style={styles.errorText}>{errors.birthday}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>電子郵件 *</Text>
                <TextInput
                  style={[styles.textInput, errors.email && styles.inputError]}
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  placeholder="example@email.com"
                  placeholderTextColor="#A3A3A3"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>電話號碼 *</Text>
                <TextInput
                  style={[styles.textInput, errors.phone && styles.inputError]}
                  value={formData.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  placeholder="09xx-xxx-xxx"
                  placeholderTextColor="#A3A3A3"
                  keyboardType="phone-pad"
                />
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>

              {/* 個人地址欄位 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>縣市 *</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, errors.city && styles.inputError]}
                  onPress={() => setShowCityModal(true)}
                >
                  <Text style={[styles.dropdownText, !formData.city && styles.placeholderText]}>
                    {getCityName(formData.city)}
                  </Text>
                  <ChevronDown size={20} color="#78716C" strokeWidth={2} />
                </TouchableOpacity>
                {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>鄉鎮市區 *</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, errors.district && styles.inputError, !formData.city && styles.disabledButton]}
                  onPress={() => formData.city && setShowDistrictModal(true)}
                  disabled={!formData.city}
                >
                  <Text style={[styles.dropdownText, !formData.district && styles.placeholderText]}>
                    {getDistrictName(formData.district)}
                  </Text>
                  <ChevronDown size={20} color={formData.city ? "#78716C" : "#D6D3D1"} strokeWidth={2} />
                </TouchableOpacity>
                {errors.district && <Text style={styles.errorText}>{errors.district}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>街道門牌 *</Text>
                <TextInput
                  style={[styles.textInput, errors.street && styles.inputError]}
                  value={formData.street}
                  onChangeText={(value) => handleInputChange('street', value)}
                  placeholder="請輸入街道門牌號碼"
                  placeholderTextColor="#A3A3A3"
                />
                {errors.street && <Text style={styles.errorText}>{errors.street}</Text>}
              </View>
            </>
          ) : (
            <>
              {/* 公司/機構基本資料 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>公司/機構名稱 *</Text>
                <TextInput
                  style={[styles.textInput, errors.companyName && styles.inputError]}
                  value={formData.companyName}
                  onChangeText={(value) => handleInputChange('companyName', value)}
                  placeholder="請輸入公司或機構名稱"
                  placeholderTextColor="#A3A3A3"
                />
                {errors.companyName && <Text style={styles.errorText}>{errors.companyName}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>組織類型 *</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, errors.organizationType && styles.inputError]}
                  onPress={() => setShowOrgTypeModal(true)}
                >
                  <Text style={[styles.dropdownText, !formData.organizationType && styles.placeholderText]}>
                    {getOrgTypeName(formData.organizationType)}
                  </Text>
                  <ChevronDown size={20} color="#78716C" strokeWidth={2} />
                </TouchableOpacity>
                {errors.organizationType && <Text style={styles.errorText}>{errors.organizationType}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>公司/機構電話號碼 *</Text>
                <TextInput
                  style={[styles.textInput, errors.companyPhone && styles.inputError]}
                  value={formData.companyPhone}
                  onChangeText={(value) => handleInputChange('companyPhone', value)}
                  placeholder="02-xxxx-xxxx"
                  placeholderTextColor="#A3A3A3"
                  keyboardType="phone-pad"
                />
                {errors.companyPhone && <Text style={styles.errorText}>{errors.companyPhone}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>統一編號 *</Text>
                <TextInput
                  style={[styles.textInput, errors.taxId && styles.inputError]}
                  value={formData.taxId}
                  onChangeText={(value) => handleInputChange('taxId', value)}
                  placeholder="12345678"
                  placeholderTextColor="#A3A3A3"
                  keyboardType="numeric"
                  maxLength={8}
                />
                {errors.taxId && <Text style={styles.errorText}>{errors.taxId}</Text>}
              </View>

              {/* 公司通訊地址 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>通訊地址 - 縣市 *</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, errors.companyCity && styles.inputError]}
                  onPress={() => setShowCompanyCityModal(true)}
                >
                  <Text style={[styles.dropdownText, !formData.companyCity && styles.placeholderText]}>
                    {getCompanyCityName(formData.companyCity)}
                  </Text>
                  <ChevronDown size={20} color="#78716C" strokeWidth={2} />
                </TouchableOpacity>
                {errors.companyCity && <Text style={styles.errorText}>{errors.companyCity}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>通訊地址 - 鄉鎮市區 *</Text>
                <TouchableOpacity
                  style={[styles.dropdownButton, errors.companyDistrict && styles.inputError, !formData.companyCity && styles.disabledButton]}
                  onPress={() => formData.companyCity && setShowCompanyDistrictModal(true)}
                  disabled={!formData.companyCity}
                >
                  <Text style={[styles.dropdownText, !formData.companyDistrict && styles.placeholderText]}>
                    {getCompanyDistrictName(formData.companyDistrict)}
                  </Text>
                  <ChevronDown size={20} color={formData.companyCity ? "#78716C" : "#D6D3D1"} strokeWidth={2} />
                </TouchableOpacity>
                {errors.companyDistrict && <Text style={styles.errorText}>{errors.companyDistrict}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>通訊地址 - 街道門牌 *</Text>
                <TextInput
                  style={[styles.textInput, errors.companyStreet && styles.inputError]}
                  value={formData.companyStreet}
                  onChangeText={(value) => handleInputChange('companyStreet', value)}
                  placeholder="請輸入街道門牌號碼"
                  placeholderTextColor="#A3A3A3"
                />
                {errors.companyStreet && <Text style={styles.errorText}>{errors.companyStreet}</Text>}
              </View>
            </>
          )}

        </View>

        {/* 聯絡人資料 - 只有公司/機構捐款才顯示 */}
        {formData.donationType === 'company' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={20} color="#F97316" strokeWidth={2} />
              <Text style={styles.sectionTitle}>聯絡人資料</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>姓名 *</Text>
              <TextInput
                style={[styles.textInput, errors.contactName && styles.inputError]}
                value={formData.contactName}
                onChangeText={(value) => handleInputChange('contactName', value)}
                placeholder="請輸入聯絡人姓名"
                placeholderTextColor="#A3A3A3"
              />
              {errors.contactName && <Text style={styles.errorText}>{errors.contactName}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>職稱 *</Text>
              <TextInput
                style={[styles.textInput, errors.contactTitle && styles.inputError]}
                value={formData.contactTitle}
                onChangeText={(value) => handleInputChange('contactTitle', value)}
                placeholder="請輸入職稱"
                placeholderTextColor="#A3A3A3"
              />
              {errors.contactTitle && <Text style={styles.errorText}>{errors.contactTitle}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>電子信箱 *</Text>
              <TextInput
                style={[styles.textInput, errors.contactEmail && styles.inputError]}
                value={formData.contactEmail}
                onChangeText={(value) => handleInputChange('contactEmail', value)}
                placeholder="example@email.com"
                placeholderTextColor="#A3A3A3"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.contactEmail && <Text style={styles.errorText}>{errors.contactEmail}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>手機號碼 *</Text>
              <TextInput
                style={[styles.textInput, errors.contactPhone && styles.inputError]}
                value={formData.contactPhone}
                onChangeText={(value) => handleInputChange('contactPhone', value)}
                placeholder="09xx-xxx-xxx"
                placeholderTextColor="#A3A3A3"
                keyboardType="phone-pad"
              />
              {errors.contactPhone && <Text style={styles.errorText}>{errors.contactPhone}</Text>}
            </View>
          </View>
        )}

        {/* 收據資訊 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Receipt size={20} color="#F97316" strokeWidth={2} />
            <Text style={styles.sectionTitle}>收據資訊</Text>
          </View>

          {formData.donationType === 'personal' ? (
            <>
              {/* 個人收據寄發方式選擇 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>收據寄發方式 *</Text>
                <View style={styles.checkboxGroup}>
                  <TouchableOpacity
                    style={styles.checkboxButton}
                    onPress={() => handleInputChange('receiptDeliveryMethod', 'tax_upload')}
                  >
                    <View style={[
                      styles.checkbox,
                      formData.receiptDeliveryMethod === 'tax_upload' && styles.checkboxSelected
                    ]}>
                      {formData.receiptDeliveryMethod === 'tax_upload' && (
                        <Text style={styles.checkmarkText}>✓</Text>
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>直接上傳至國稅局作為個人綜所稅申報，免寄紙本收據</Text>
                  </TouchableOpacity>
                  
                  
                  <TouchableOpacity
                    style={styles.checkboxButton}
                    onPress={() => handleInputChange('receiptDeliveryMethod', 'no_receipt')}
                  >
                    <View style={[
                      styles.checkbox,
                      formData.receiptDeliveryMethod === 'no_receipt' && styles.checkboxSelected
                    ]}>
                      {formData.receiptDeliveryMethod === 'no_receipt' && (
                        <Text style={styles.checkmarkText}>✓</Text>
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>不需收據（無抵稅需求、不想要收據）</Text>
                  </TouchableOpacity>
                </View>
                {errors.receiptDeliveryMethod && <Text style={styles.errorText}>{errors.receiptDeliveryMethod}</Text>}
              </View>

              {/* 收據抬頭 - 只有在選擇上傳國稅局時才顯示 */}
              {formData.receiptDeliveryMethod === 'tax_upload' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>收據抬頭 *</Text>
                  <View style={styles.receiptTitleContainer}>
                    <TextInput
                      style={[styles.textInput, styles.receiptTitleInput, errors.receiptTitle && styles.inputError]}
                      value={formData.receiptTitle}
                      onChangeText={(value) => handleInputChange('receiptTitle', value)}
                      placeholder="請輸入與身分證姓名一致的捐款人姓名"
                      placeholderTextColor="#A3A3A3"
                    />
                    <TouchableOpacity
                      style={styles.autoFillButton}
                      onPress={handleAutoFillReceiptTitle}
                    >
                      <Text style={styles.autoFillButtonText}>同捐款人</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.helperText}>
                    * 請確保收據抬頭與您身分證上的姓名完全一致，以利國稅局申報作業
                  </Text>
                  {errors.receiptTitle && <Text style={styles.errorText}>{errors.receiptTitle}</Text>}
                </View>
              )}
            </>
          ) : (
            <>
              {/* 公司/機構收據寄發方式選擇 */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>收據寄發方式 *</Text>
                <View style={styles.checkboxGroup}>
                  <TouchableOpacity
                    style={styles.checkboxButton}
                    onPress={() => handleInputChange('receiptDeliveryMethod', 'mail')}
                  >
                    <View style={[
                      styles.checkbox,
                      formData.receiptDeliveryMethod === 'mail' && styles.checkboxSelected
                    ]}>
                      {formData.receiptDeliveryMethod === 'mail' && (
                        <Text style={styles.checkmarkText}>✓</Text>
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>寄送紙本收據</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.checkboxButton}
                    onPress={() => handleInputChange('receiptDeliveryMethod', 'no_receipt')}
                  >
                    <View style={[
                      styles.checkbox,
                      formData.receiptDeliveryMethod === 'no_receipt' && styles.checkboxSelected
                    ]}>
                      {formData.receiptDeliveryMethod === 'no_receipt' && (
                        <Text style={styles.checkmarkText}>✓</Text>
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>不需收據（無抵稅需求、不想要收據）</Text>
                  </TouchableOpacity>
                </View>
                {errors.receiptDeliveryMethod && <Text style={styles.errorText}>{errors.receiptDeliveryMethod}</Text>}
              </View>

              {/* 公司收據資訊 - 只有在選擇寄送紙本時才顯示 */}
              {formData.receiptDeliveryMethod === 'mail' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>收據抬頭 *</Text>
                    <View style={styles.receiptTitleContainer}>
                      <TextInput
                        style={[styles.textInput, styles.receiptTitleInput, errors.receiptTitle && styles.inputError]}
                        value={formData.receiptTitle}
                        onChangeText={(value) => handleInputChange('receiptTitle', value)}
                        placeholder="請輸入收據抬頭"
                        placeholderTextColor="#A3A3A3"
                      />
                      <TouchableOpacity
                        style={styles.autoFillButton}
                        onPress={() => {
                          if (formData.companyName.trim()) {
                            setFormData(prev => ({ ...prev, receiptTitle: formData.companyName }));
                            if (errors.receiptTitle) {
                              setErrors(prev => ({ ...prev, receiptTitle: '' }));
                            }
                            triggerHapticFeedback();
                          } else {
                            Alert.alert('提醒', '請先填寫公司/機構名稱');
                          }
                        }}
                      >
                        <Text style={styles.autoFillButtonText}>同公司名稱</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.helperText}>
                      * 收據抬頭通常為公司/機構的正式名稱
                    </Text>
                    {errors.receiptTitle && <Text style={styles.errorText}>{errors.receiptTitle}</Text>}
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>收據統一編號 *</Text>
                    <View style={styles.receiptTitleContainer}>
                      <TextInput
                        style={[styles.textInput, styles.receiptTitleInput, errors.receiptTaxId && styles.inputError]}
                        value={formData.receiptTaxId}
                        onChangeText={(value) => handleInputChange('receiptTaxId', value)}
                        placeholder="12345678"
                        placeholderTextColor="#A3A3A3"
                        keyboardType="numeric"
                        maxLength={8}
                      />
                      <TouchableOpacity
                        style={styles.autoFillButton}
                        onPress={() => {
                          if (formData.taxId.trim()) {
                            setFormData(prev => ({ ...prev, receiptTaxId: formData.taxId }));
                            if (errors.receiptTaxId) {
                              setErrors(prev => ({ ...prev, receiptTaxId: '' }));
                            }
                            triggerHapticFeedback();
                          } else {
                            Alert.alert('提醒', '請先填寫公司統一編號');
                          }
                        }}
                      >
                        <Text style={styles.autoFillButtonText}>同公司編號</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.helperText}>
                      * 收據統一編號通常與公司登記的統一編號相同
                    </Text>
                    {errors.receiptTaxId && <Text style={styles.errorText}>{errors.receiptTaxId}</Text>}
                  </View>
                </>
              )}
            </>
          )}

          {/* 收據寄送地址 - 只有公司/機構捐款且選擇寄送紙本才顯示 */}
          {formData.donationType === 'company' && formData.receiptDeliveryMethod === 'mail' && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>收據寄送地址 *</Text>
              <TextInput
                style={[styles.textInput, styles.textArea, errors.receiptAddress && styles.inputError]}
                value={formData.receiptAddress}
                onChangeText={(value) => handleInputChange('receiptAddress', value)}
                placeholder="請輸入收據寄送地址"
                placeholderTextColor="#A3A3A3"
                multiline
                numberOfLines={3}
              />
              {errors.receiptAddress && <Text style={styles.errorText}>{errors.receiptAddress}</Text>}
            </View>
          )}
        </View>

        {/* 注意事項 */}
        <View style={styles.noticeSection}>
          <Text style={styles.noticeTitle}>注意事項</Text>
          <Text style={styles.noticeText}>
            {/* 根據捐款類型和收據方式顯示不同內容 */}
            {formData.donationType === 'company' ? (
              // 公司/機構捐款
              formData.receiptDeliveryMethod === 'mail' ? (
                `• 收據將在捐款確認後的7個工作天內寄出${'\n'}• 請確保您提供的地址正確，以免影響收據寄送${'\n'}• 如有任何問題，請聯繫客服：service@pawcket.com`
              ) : formData.receiptDeliveryMethod === 'no_receipt' ? (
                `• 您已選擇不需收據${'\n'}• 如有任何問題，請聯繫客服：service@pawcket.com`
              ) : (
                `• 如有任何問題，請聯繫客服：service@pawcket.com`
              )
            ) : formData.receiptDeliveryMethod === 'tax_upload' ? (
              // 個人捐款 - 上傳國稅局
              `• 收據將直接上傳至國稅局系統，不會寄送紙本${'\n'}• 如有任何問題，請聯繫客服：service@pawcket.com`
            ) : formData.receiptDeliveryMethod === 'no_receipt' ? (
              // 個人捐款 - 不需收據
              `• 您已選擇不需收據${'\n'}• 如有任何問題，請聯繫客服：service@pawcket.com`
            ) : (
              // 預設情況
              `• 如有任何問題，請聯繫客服：service@pawcket.com`
            )}
          </Text>
        </View>

        {/* 提交按鈕 */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>提交資料</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 縣市選擇Modal */}
      <Modal
        visible={showCityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>選擇縣市</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCityModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {taiwanCities.map((city) => (
                <TouchableOpacity
                  key={city.id}
                  style={[
                    styles.optionItem,
                    formData.city === city.id && styles.selectedOption
                  ]}
                  onPress={() => handleCitySelect(city.id, city.name)}
                >
                  <Text style={[
                    styles.optionText,
                    formData.city === city.id && styles.selectedOptionText
                  ]}>
                    {city.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 鄉鎮市區選擇Modal */}
      <Modal
        visible={showDistrictModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDistrictModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>選擇鄉鎮市區</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowDistrictModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {(districts[formData.city] || []).map((district) => (
                <TouchableOpacity
                  key={district.id}
                  style={[
                    styles.optionItem,
                    formData.district === district.id && styles.selectedOption
                  ]}
                  onPress={() => handleDistrictSelect(district.id, district.name)}
                >
                  <Text style={[
                    styles.optionText,
                    formData.district === district.id && styles.selectedOptionText
                  ]}>
                    {district.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 組織類型選擇Modal */}
      <Modal
        visible={showOrgTypeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOrgTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>選擇組織類型</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowOrgTypeModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {organizationTypes.map((orgType) => (
                <TouchableOpacity
                  key={orgType.id}
                  style={[
                    styles.optionItem,
                    formData.organizationType === orgType.id && styles.selectedOption
                  ]}
                  onPress={() => handleOrgTypeSelect(orgType.id, orgType.name)}
                >
                  <Text style={[
                    styles.optionText,
                    formData.organizationType === orgType.id && styles.selectedOptionText
                  ]}>
                    {orgType.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 公司縣市選擇Modal */}
      <Modal
        visible={showCompanyCityModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCompanyCityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>選擇縣市</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCompanyCityModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {taiwanCities.map((city) => (
                <TouchableOpacity
                  key={city.id}
                  style={[
                    styles.optionItem,
                    formData.companyCity === city.id && styles.selectedOption
                  ]}
                  onPress={() => handleCompanyCitySelect(city.id, city.name)}
                >
                  <Text style={[
                    styles.optionText,
                    formData.companyCity === city.id && styles.selectedOptionText
                  ]}>
                    {city.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 公司鄉鎮市區選擇Modal */}
      <Modal
        visible={showCompanyDistrictModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCompanyDistrictModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>選擇鄉鎮市區</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowCompanyDistrictModal(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalContent}>
              {(districts[formData.companyCity] || []).map((district) => (
                <TouchableOpacity
                  key={district.id}
                  style={[
                    styles.optionItem,
                    formData.companyDistrict === district.id && styles.selectedOption
                  ]}
                  onPress={() => handleCompanyDistrictSelect(district.id, district.name)}
                >
                  <Text style={[
                    styles.optionText,
                    formData.companyDistrict === district.id && styles.selectedOptionText
                  ]}>
                    {district.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFDFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FEFDFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1917',
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  section: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#44403C',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1C1917',
    backgroundColor: '#FEFDFB',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 24,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D6D3D1',
    backgroundColor: '#FFFFFF',
  },
  radioSelected: {
    borderColor: '#F97316',
    backgroundColor: '#F97316',
  },
  radioLabel: {
    fontSize: 14,
    color: '#44403C',
  },
  checkboxGroup: {
    gap: 12,
  },
  checkboxButton: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#D6D3D1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxSelected: {
    borderColor: '#F97316',
    backgroundColor: '#F97316',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#44403C',
    flex: 1,
    lineHeight: 20,
  },
  receiptTitleContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  receiptTitleInput: {
    flex: 1,
  },
  autoFillButton: {
    backgroundColor: '#F97316',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  autoFillButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  helperText: {
    fontSize: 12,
    color: '#78716C',
    marginTop: 4,
    lineHeight: 16,
  },
  donationTypeSection: {
    margin: 20,
    marginBottom: 0,
  },
  donationTypeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1917',
    marginBottom: 16,
    textAlign: 'center',
  },
  donationTypeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  donationTypeButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E7E5E4',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  donationTypeButtonActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#F97316',
  },
  donationTypeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#78716C',
  },
  donationTypeButtonTextActive: {
    color: '#F97316',
  },
  noticeSection: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EA580C',
    marginBottom: 8,
  },
  noticeText: {
    fontSize: 12,
    color: '#9A3412',
    lineHeight: 18,
  },
  submitButton: {
    margin: 20,
    backgroundColor: '#F97316',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F97316',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // 下拉選單樣式
  dropdownButton: {
    borderWidth: 1,
    borderColor: '#E7E5E4',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEFDFB',
    minHeight: 48,
  },
  dropdownText: {
    fontSize: 16,
    color: '#1C1917',
    flex: 1,
  },
  placeholderText: {
    color: '#A3A3A3',
  },
  disabledButton: {
    backgroundColor: '#F5F5F4',
    borderColor: '#D6D3D1',
  },
  // Modal樣式
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E5E4',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1917',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#F5F5F4',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#78716C',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
  },
  optionItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F4',
  },
  selectedOption: {
    backgroundColor: '#FFF7ED',
  },
  optionText: {
    fontSize: 16,
    color: '#1C1917',
  },
  selectedOptionText: {
    color: '#F97316',
    fontWeight: '600',
  },
});