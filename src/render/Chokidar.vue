<template>
  <div>this is chokidar service!</div>
</template>

<script>

export default {
  created () {
    console.log('chokidar created:')
    console.log(this.$bus.getSubService('chokidarService').win.id)
  }
}
</script>
