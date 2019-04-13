export default {
  scrollable: true, //是否可滚动
  direction: 'Y', //滚动方向
  topBounceDistance: 100, //顶部弹性区间
  bottomBounceDistance: 100,
  topBounceTime: 500, //弹性区间回复时间
  bottomBounceTime: 500,

  momentum: true, //添加惯性滚动
  momentumDuration: 2500, //普通惯性滚动时间
  momentumBounceDuration: 500,  //触底滚动时间（快速）
  momentumLimitTime: 300, //时间阈值，超时说明触摸停留，不触发
  momentumLimitDistance: 15,  //触发最小距离阈值
  deceleration: 0.0015,

  bounce: true, //两侧是否添加弹性特征
  bounceDuration: 800,  //
  bounceLimitDistance: 1000,

  autoplay: false,  //是否轮播（自动）
  playDuration: 2000, //轮播时长
  playStyle: 'ease',  //轮播动画方式
  interval: 1000, //轮播间隔
  loop: true,  //是否循环轮播

  updateTriggerDistance: 80, //下拉阈值，超出该阈值会触发下拉事件（下拉更新  惯性滚动不会超出该范围
  updateTirggerDelay: 0,  //下拉事件持续时间（可用于刷新动画播放，transition的delay
  loadTriggerDistance: 80,  //上拉阈值，超出触发上拉事件（上拉加载  惯性滚动不会超出该范围
  loadTriggerDelay: 3000, //上拉回弹的delay
  update: false,  //默认没有下拉更新与上拉加载事件
  load: false,
}