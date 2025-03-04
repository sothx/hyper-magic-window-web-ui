const systemApplicationList = {
    'com.lbe.security.miui': 1, // com.lbe.security.miui
    'com.miui.player': 1, // com.miui.player
    'com.miui.fm': 1, // com.miui.fm
    'com.miui.hybrid': 1, // com.miui.hybrid
    'com.miui.securitycenter': 1, // com.miui.securitycenter
    'com.miui.compass': 1, // com.miui.compass
    'com.miui.contentextension': 1, // 传送门
    'com.miui.misound': 1, // com.miui.misound
    'com.miui.voiceassist': 1, // com.miui.voiceassist
    'com.miui.securityadd': 1, // com.miui.securityadd
    'com.mi.earphone': 1, // 小米耳机
    'com.xiaomi.youpin': 1, // 小米有品
    'com.xiaomi.mico': 1, // 小米音箱
    'com.xiaomi.mi_connect_service': 1, // 小米互联通信服务
    'cn.wps.moffice_eng.xiaomi.lite': 1, // 小米文档查看器（WPS定制）
    'com.android.providers.downloads.ui': 1, // 下载管理
    'com.mi.android.globalFileexplorer': 1, // 小米文件管理国际版
    'com.mi.car.mobile': 1, // 小米汽车
    'com.mi.global.bbs': 1, // 小米社区国际版
    'com.mi.global.pocobbs': 1, // 小米 POCO社区
    'com.mi.global.shop': 1, // 小米商城
    'com.mi.health': 1, // 小米运动健康
    'com.mi.print': 1, // 小米打印
    'com.baidu.input_mi': 1, //百度输入法小米版
    'com.ifengyu.intercom': 1, // 小米对讲机
    'com.mfashiongallery.emag': 1, // 小米画报
    'com.miui.accessibility': 1, // 小米无障碍
}

const topApplicationList = {
    'com.miui.touchassistant': 1, // 悬浮球
    'com.miui.whitenoise': 1, // 小米白噪音
    'com.tencent.mobileqq': 1, // QQ
    'com.tencent.mm': 1, // 微信
    'com.alibaba.android.rimet': 1, // 钉钉
    'com.coolapk.market': 1, // 酷安
    'com.sina.weibo': 1, // 微博
    'com.baidu.tieba': 1, // 贴吧
    'com.xuetangx.ykt': 1, // 雨课堂
    'io.github.vvb2060.magisk': 1, // Magisk
    'com.topjohnwu.magisk': 1, // Magisk
    'io.github.huskydg.magisk': 1, // Magisk
    'io.github.a13e300.ksuwebui': 1, // KsuWebUI
    'me.weishu.kernelsu': 1, // KSU
    'me.bmax.apatch': 1, // APatch
    'com.dna.tools': 1,  // DNA Android
    'com.sevtinge.hyperceiler': 1, // HyperCeiler
    'com.github.kr328.clash.foss': 1, // Clash For Android
    'com.github.kr328.clash': 1, // Clash For Android
    'com.github.metacubex.clash.meta': 1, // Clash For Android
    'com.rocket.e5b382b19324e0a': 1, // Clash For Android
    'dev.miuiicons.pedroz': 1, // 完美图标计划
    'com.tencent.androidqqmail': 1, // QQ邮箱
    'com.jingdong.app.mall': 1, // 京东
    'com.tencent.wework': 1, // 企业微信
    'com.tencent.weworkenterprise': 1, // 企业微信独立部署版
    'com.taobao.trip': 1, // 飞猪
    'com.fenbi.android.leo': 1, // 小猿口算
    'com.duokan.reader': 1, // 多看阅读
    'com.xiaomi.shop': 1, // 小米商城
    'com.xiaomi.smarthome': 1, // 米家
    'com.youdao.dict': 1, // 网易有道词典
    'com.netease.uu': 1, // UU加速器
    'com.lemon.lv': 1, // 剪映
    'com.valvesoftware.android.steam.community': 1, // Steam
    'com.douban.book.reader': 1, // 豆瓣阅读
    'com.amazon.kindlefc': 1, // Kindle
    'com.alicloud.databox': 1, // 阿里云盘
    'com.huawei.appmarket': 1, // 华为应用商店
    'com.huawei.smarthome': 1, // 华为智慧生活
    'mark.via': 1, // via
    'com.fenbi.android.servant': 1, // 粉笔
    'com.fenbi.android.zhaojiao': 1, // 粉笔教师
    'com.eusoft.eudic': 1, // 欧路词典
    'com.eusoft.ting.en': 1, // 每日英语体力
    'com.cnki.android.cnkimobile': 1, // 全球学术快报
    'com.zui.calculator': 1, // ZUI计算器
    'com.jd.app.reader': 1, // 京东读书
    'com.huajiao': 1, // 花椒直播
    'com.youku.phone': 1, // 优酷视频
    'com.tencent.qqlive': 1, // 腾讯视频
    'com.xiaomi.gamecenter': 1, // 小米游戏中心
    'com.kugou.android': 1, // 酷狗音乐
    'com.ss.android.ugc.aweme': 1, // 抖音
    'com.ss.android.ugc.live': 1, // 抖音火山版
    'com.ss.android.ugc.aweme.lite': 1, // 抖音极速版
    'com.smile.gifmaker': 1, // 快手
    'com.kuaishou.nebula': 1, // 快手极速版
    'com.bdatu.geography': 1, // 华夏地理
    'com.ubestkid.beilehu.android': 1, // 贝乐虎儿歌
    'youqu.android.todesk': 1, // Todesk
    'com.tencent.docs': 1, // 腾讯文档
    'com.tencent.pao': 1, // 天天酷跑
    'com.estrongs.android.pop': 1, // ES文件管理器
    'com.adobe.reader': 1, // Adobe Acrobat
    'com.microsoft.skydrive': 1, // Microsoft OneDrive
    'cn.com.langeasy.LangEasyLexis': 1, // 不背单词
    'cn.ticktick.task': 1, // 滴答清单
    'com.google.earth': 1, //谷歌地图
    'com.omarea.vtools': 1, // Scene
    'com.plan.kot32.tomatotime': 1, // 番茄Todo
    'com.farplace.qingzhuo': 1, // 清浊
    'com.xiachufang': 1, // 下厨房
    'com.happyteam.dubbingshow': 1, // 配音秀
    'czh.mindnode': 1, // 思维导图
    'com.chrissen.card': 1, // 麻雀记
    'top.onepix.timeblock': 1, // 块时间
    'www.imxiaoyu.com.musiceditor': 1, // 音乐剪辑
    'com.mmbox.xbrowser': 1, // X浏览器
    'com.flyersoft.moonreader': 1, // 静读天下
    'com.flyersoft.moonreaderp': 1, // 静读天下 Pro
    'com.yikaobang.yixue': 1, // 医考帮
    'com.kwai.m2u': 1, // 一甜相机
    'com.qiyi.video.pad': 1, // 爱奇艺Pad版
    'com.baidu.baidutranslate': 1, // 百度翻译
    'org.zwanoo.android.speedtest': 1, // SpeedTest
    'com.xiwang.zaixian': 1, // 希望学
    'com.yozo.office': 1, //鲸鲮office
    'com.taobao.taobao': 1, // 淘宝
    'cn.canva.editor': 1, // Canva可画
    'com.singularity.tiangong': 1, // 天工
    'com.mubu.app': 1, // 幕布
    'chuxin.shimo.shimowendang': 1, // 石墨文档
    'com.roblox.client': 1, // ROBLOX
    'com.netease.cloudmusic': 1, // 网易云音乐
    'com.netease.mc.mi': 1, // 网易我的世界
    'com.netease.x19': 1, // 网易我的世界
    'com.netease.mc.huawei': 1, // 网易我的世界
    'com.netease.mc.vivo': 1, // 网易我的世界
    'com.netease.mc.oppo': 1, // 网易我的世界
    'com.netease.mc.honor': 1, // 网易我的世界
    'com.netease.mc.bilibili': 1, // 网易我的世界
    'com.netease.mc.nearme.gamecenter': 1, // 网易我的世界
    'com.netease.mc': 1, // 网易我的世界
    'com.netease.mctest': 1, // 网易我的世界
    'com.hicloud.browser': 1, // 花瓣浏览器
    'com.hihonor.health': 1, // 荣耀运动健康
    'com.ss.android.ugc.livelite': 1, // 抖音商城
    'com.oray.sunlogin': 1, // 向日葵
    'com.microsoft.todos': 1, // 微软todo
    'com.jdjdc.jdfastjdc': 1, // 奶酪单词
    'com.google.android.apps.translate': 1, // google翻译
    'com.adsk.sketchbook': 1, // Sketchbook
    'com.pick.sketchbook': 1, // Sketchbook
    'com.ihuman.recite': 1, // 万词王
    'com.ctfile': 1, // 城通网盘
    'com.quark.scanking': 1, // 夸克扫描王
    'com.hunantv.imgo.activity': 1, // 芒果TV
    'com.sohu.sohuvideo': 1, // 搜狐视频
    'com.wuba.town.client': 1, //58同城
    'com.yhqx.player': 1, // 光子播放器
    'com.lixiangdong.mediaplayer': 1, // 万能电影播放器
    'cn.ylkj.zmjh': 1, // 朝暮计划
    'com.yixinli.muse': 1, // 冥想星球
    'com.antutu.ABenchMark': 1, // 安兔兔评测
    'cn.honor.qinxuan': 1, // 荣耀亲选
    'com.fenbi.android.zenglish.hd': 1, // 斑马AI学
    'com.huawei.videoeditor': 1, // 花瓣剪辑
    'com.huawei.genexcloud.speedtest': 1, // 花瓣测速
    'com.huawei.ch18': 1, // 华为智能体脂秤
    'com.hihonor.dz.reader': 1, // 荣耀阅读
    'com.hihonor.vmall': 1, // 荣耀商城
    'com.hihonor.magichome': 1, // 荣耀智慧空间
    'com.hihonor.heartstudy': 1, // 荣耀心脏健康研究
    'cn.ieway.evcapture': 1, // EV录屏
    'cn.ieway.evplayer2': 1, // EVPlayer2
    'com.aliyun.wuying.enterprise': 1, // 无影云电脑
    'com.jingdong.app.reader.campus': 1, // 京东读书专业版
    'com.UCMobile': 1, // UC浏览器
    'com.quark.browser': 1, // 夸克浏览器
    'com.smzdm.client.android': 1, // 什么值得买
    'com.baidu.netdisk': 1, // 百度网盘
    'com.mfcloudcalculate.networkdisk': 1, // 123云盘
    'com.chinamobile.mcloud': 1, // 中国移动云盘
    'info.muge.appshare': 1, // AppShare
    'com.x7890.shortcutcreator': 1, // 创建快捷方式
    'org.kde.kdeconnect_tp': 1, // KDE Connect
    'com.tencent.weread': 1, // 微信读书
    'com.larus.nova': 1, // 豆包
    'com.moonshot.kimichat': 1, // Kimi 智能助手
    'com.baidu.newapp': 1, // 文小言
    'com.tencent.hunyuan.app.chat': 1, //腾讯元宝
    'jp.pokemon.pokemonsleep': 1, // Pokémon Sleep
    'com.heytap.headset': 1, // 欢律
    'com.twitter.android': 1, // X
    'cn.jagat.main': 1, // Jagat果汁儿
    'com.furrybar.chat.app': 1, // FurryBar
    'me.ele': 1, // 饿了么
    'com.max.xiaoheihe': 1, // 小黑盒
    'com.ruanmei.ithome': 1, // IT之家
    'com.youdao.translator': 1, // 有道翻译官
    'com.netflix.NGP.MonumentValley3': 1, // 纪念碑谷3
    'com.ophone.reader.ui': 1, // 咪咕阅读
    'studio.fountainhead.habicat': 1, // 像素习惯
    'com.hihonor.appmarket': 1, // 荣耀应用市场
    'cn.wenyu.bodian': 1, // 波点音乐
    'com.zte.smarthome': 1, // 中兴智慧生活
    'com.phoenix.read': 1, // 红果免费短剧
    'com.bilibili.app.in': 1, // 哔哩哔哩国际版
    'com.bilibili.app.blue': 1, // 哔哩哔哩概念
    'com.joey.colors.simple.c': 1, // 中国传统色
    'com.hanfuhui': 1, // 汉服荟
    'com.hurantech.cherrysleep': 1, // 樱桃睡眠
    'tech.caicheng.youshi': 1, // 有诗
    'org.panda.words': 1, // 熊猫在学
    'com.tencent.phoenix': 1, // 秒剪
    'com.tencent.wetype': 1, // 微信输入法
    'com.tencent.wehear': 1, // 微信听书
    'com.tencent.weishi': 1, // 腾讯微视
    'com.ctg.itrdc.clouddesk': 1, // 天翼云电脑
    'com.oppo.store': 1, // OPPO 商城
    'com.pupumall.customer': 1, // 朴朴超市
    'me.tangke.gamecores': 1, // 机核
    'com.xunmeng.pinduoduo': 1, // 拼多多
    'com.vblast.flipaclip': 1, // FlipaClip
    'com.gstarmc.android': 1, // CAD看图王
    'com.quickview3d': 1, // 快视3D看图
    'com.aihuishou.opt': 1, // 拍机堂
    'com.duolingo': 1, // 多邻国
    'cn.etouch.ecalendar.life': 1, // 微鲤万年历
    'cn.etouch.ecalendar': 1, // 中华万年历
    'com.gamestar.pianoperfect': 1, // 随身乐队
    'me.yoopu.app.songbook': 1, // 有谱么
    'com.autonavi.minimap': 1, // 高德地图
    'com.tencent.map': 1, // 腾讯地图
    'com.baidu.BaiduMap': 1, // 百度地图
    'com.yuzebin.pokemon': 1, // 神奇宝贝图鉴
    'com.CDA.StructureMaster': 1, // 结构大师
    'com.cxincx.xxjz': 1, // 小星记账
    'com.netease.uurouter': 1, // UU主机加速
    'com.yuewen.authorapp': 1, // 作家助手
    'com.bytedance.writer_assistant_flutter': 1, // 番茄作家助手
    'com.qihoo.namiso': 1, // 纳米AI搜索
    'com.lizhiweike': 1, // 荔课
    'com.qimao.writerassistant': 1, // 七猫作家助手
    'com.hmz.koudaiwriting': 1, // 口袋写作
    'com.xmyl.writing': 1, // 天天写作
    'com.onemore.life': 1, // 1MORE MUSIC
    'com.xianghu.organization': 1, //墨督督
    'com.ztgame.yyzy': 1, // 月圆之夜
    'com.yyzy.mi': 1, // 月圆之夜
    'com.yyzy.huawei': 1, // 月圆之夜
    'com.yyzy.oppo': 1, // 月圆之夜
    'com.yyzy.vivo': 1, // 月圆之夜
    'com.yyzy.honor': 1, // 月圆之夜
    'com.ztgame.yyzy.aligames': 1, // 月圆之夜
    'com.vivo.vivotws': 1, // vivo耳机
    'com.vivo.space': 1, // vivo官网
    'com.realme.storecn': 1, // realme商城
    'com.sony.store.china': 1, // 索尼中国
    'com.coloros.backuprestore': 1, // 手机搬家
    'com.heytap.health': 1, // 欢太健康
    'com.heytap.smarthome': 1, // 欢太智能家居
    'com.vivo.health': 1, // vivo健康
    'com.vivo.easyshare': 1, // 互传
    'com.baidu.duer.superapp': 1, // 小度
    'com.orion.xiaoya.speakerclient': 1, // 小雅
    'cn.com.langeasy.EasyListen': 1, // 轻听英语
    'com.iflytek.sparkdoc': 1, // 讯飞文书
    'com.jifen.qukan': 1, // 趣头条
    'com.taobao.litetao': 1, // 淘宝特价版
    'com.sankuai.meituan': 1, // 美团
    'com.netease.gl': 1, // 网易大神
    'com.futuremark.dmandroid.application': 1, // 3DMark
    'com.antutu.aibenchmark': 1, // 安兔兔AI评测
    'com.xiaoji.emulator': 1, // 小鸡模拟器
    'com.xiaoji.emulator64': 1, // 小鸡模拟器
    'com.manmanbuy.bijia': 1, // 慢慢买
    'com.psyone.brainmusic': 1, // 小睡眠
    'com.heartide.xinchao.stressandroid': 1, // 心潮
    'cn.eeo.classin': 1, //ClassIn
    'com.qiekj.user': 1, //胖乖生活
    'com.kurogame.kjq': 1, //库街区
    'my.maya.android':1,//多闪
    'com.evideo.MobileKTV': 1, // K米
    'com.lehuoapp.mm': 1,// 乐活
    'com.nice.main': 1, // nice
    'bingdic.android.activity': 1, //微软必应词典
    'com.youdao.hindict': 1, // U-Dictionary
    'com.microsoft.bing': 1, // 微软必应
    'com.microsoft.translator': 1, // 微软翻译
    'com.naver.labs.translator': 1, // Papago
    'com.zhihu.android.lite': 1, // 知乎盐选版
    'com.zhihu.vip.android': 1, // 盐选故事
    'com.zhihu.daily.android': 1, // 知乎日报
    'com.zhihu.gongkao.android': 1, // 一起公考AI课
    'com.molica.mainapp': 1, // Molica AI
    'com.taige.mygold': 1, // 妙看极速版
    'com.ss.android.article.daziban': 1, // 爱看
    'com.jihuanshe': 1, // 集换社
    'com.ydtx.camera': 1, // 元道经纬相机
    'com.sx.xiaoai': 1, // Moo日记
    'cn.missevan': 1, // 猫耳FM
    'pro.youqian.bill': 1, // 小青账
    'com.shark.jizhang': 1, // 鲨鱼记账
    'com.android.miaoa.achai': 1, // 阿柴记账
    'com.candybook.secretplanetandroid': 1, // 秘密星球
    'com.android.superli.btremote': 1, // 蓝牙遥控
    'com.boohee.box': 1, // 薄荷宝箱
    'com.youdao.xiaop': 1, // 有道小P
    'com.wandoujia.eyepetizer': 1, // 开眼
    'com.youqi.fjjf': 1, // 饭橘
    'com.magicalstory.reader': 1, // 漫读
    'com.mankson.reader': 1, // 磁力猫
    'com.gswxxn.unlockmilink': 1, // 小米不妙·享
    'com.lanjinger.choiassociatedpress': 1, // 财联社
    'com.sxyyt.aijm': 1, // 省心英语
    'com.iyuba.American': 1, // 走遍美国
    'jp.pokemon.pokemontcgp': 1, //Pokémon Trading Card Game Pocket
    'com.baicizhan.ielts.app': 1, // 百词斩雅思
    'com.dancefitme.cn': 1, // 热汗舞蹈
    'uni.UNI1EB902E': 1, // KOKONI3D
    'com.kokoni.pad': 1, // KOKONI3D PAD
    'org.sojex.finance': 1, // 口袋贵金属
    'com.zhumaonline.exercise': 1, // 竹马
    'com.gptqcio.lrhtfmqer': 1, // 查字字典大全
    'com.zzvcom.uxin.yxgs': 1, // 优学高手
    'com.zlketang.mm': 1, // 之了课堂
    'com.eastmoney.app.qihuobao': 1, // 东方财富期货宝
    'com.eastmoney.haitunlive': 1, // 浪客
    'com.kiloo.subwaysurf': 1, // 地铁跑酷
    'com.changba': 1, // 唱吧
    'com.rockets.chang': 1, // 唱鸭
    'com.jv.samsungeshop': 1, // 三星商城
    'com.eastmoney.innovation.android': 1, // 妙想
    'com.eastmoney.android.choice': 1, // Choice数据
    'com.eastmoney.android.gubaproj': 1, // 股吧
}

export default {
    ...systemApplicationList,
    ...topApplicationList
}