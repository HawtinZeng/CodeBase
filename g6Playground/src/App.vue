<script setup lang="ts">
import { ComboEvent, Graph, NodeData, NodeEvent } from '@antv/g6'
import { onMounted } from 'vue'
onMounted(() => {
  const graph = new Graph({
    container: document.getElementById('container'),
    width: 1500,
    height: 1500,
    data: {
      nodes: [
        { id: 'node1', combo: 'combo1', style: { x: 250, y: 150 } },
        { id: 'node2', combo: 'combo1', style: { x: 350, y: 150 } },
        { id: 'node4', combo: 'combo1', style: { x: 350, y: 400 } },
        { id: 'node3', combo: 'combo2', style: { x: 250, y: 300 } }
      ],
      combos: [
        { id: 'combo1', combo: 'combo2' },
        { id: 'combo2', style: {} }
      ],
      edges: [
        {
          id: '1',
          source: 'node1',
          target: 'node2'
        },
        {
          id: '2',
          source: 'node2',
          target: 'node4'
        }
      ]
    },
    behaviors: [
      {
        type: 'drag-element',
        dropEffect: 'link'
      }
    ]
  })
  let dragingNode: string | undefined
  graph.on(NodeEvent.DRAG_START, (e) => {
    dragingNode = e.target.id
  })

  graph.on(ComboEvent.DROP, (e) => {
    if (dragingNode) {
      const edges = graph.getRelatedEdgesData(dragingNode)
      graph.removeEdgeData(edges.map((e) => e.id))
    }
    graph.draw()
  })

  graph.render()
})
</script>

<template>
  <h1>Example for drag a node into another combo, correctly delete the old edges</h1>
  <div id="container" style="width: 100%; height: 100%" />
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
