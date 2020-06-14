<template>
  <div class="app-about-box">
    <div class="app-name-box">
      <img
        style="height: 50px;"
        src="@/assets/logo.png"
      >
      <span class="app-name-title">Cloud Disk Manager</span>
      <span class="version-title">Version</span>
      <span class="version-text">{{ $electron.remote.app.getVersion() }}</span>
    </div>
    <div class="app-about-content" />
    <div class="app-about-footer">
      <span style="flex: 1;">Author: Pure-Peace</span>
      <button class="github-button">
        <svg-icon icon-class="github" />
      </button>
      <span>Cloud Disk Manager © 2020</span>
    </div>
  </div>
</template>

<style lang="less" scoped>
@import '../../themes/light.less';

.app-about-box {
  background: @primary;
  height: 100%;
  padding: 20px 30px;
  color: #FAFAFA;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}

.app-name-box {
    display: flex;
    align-items: center;
}

.app-name-title {
    margin-left: 10px;
    font-size: 16px;
    font-weight: bold;
    flex: 1;
}

.app-about-content {
    padding: 20px 10px;
    flex: 1;
    font-weight: lighter;
}

.app-about-footer {
    font-size: 12px;
    display: flex;
}

.version-title {
    font-size: 26px;
    font-weight: lighter;
}

.version-text {
    margin-left: 10px;
    font-size: 18px;
    font-weight: lighter;
}

.github-button {
    font-size: 16px;
    color: #FFFFFF;
    margin: 0 10px;
}

.github-button:hover {
    filter: brightness(.7);
}
</style>
