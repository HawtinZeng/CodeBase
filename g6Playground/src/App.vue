<script setup lang="ts">
import { ComboEvent, Graph, NodeEvent, type NodeData } from '@antv/g6'
import { onMounted } from 'vue'
import { uniqueId } from 'lodash'

let graph: Graph
onMounted(() => {
  graph = new Graph({
    container: document.getElementById('container')!,
    width: 1500,
    height: 1000,
    data: {
      nodes: [
        { id: 'node1', combo: '', style: { x: 250, y: 150, labelText: 'node1' } },
        { id: 'node2', combo: '', style: { x: 350, y: 150, labelText: 'node2' } },
        { id: 'node4', combo: '', style: { x: 350, y: 400, labelText: 'node4' } },
        { id: 'node3', combo: 'combo2', style: { x: 250, y: 300, labelText: 'node3' } }
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

  window.graph = graph
  graph.on(NodeEvent.CLICK, (e) => {
    const id = e.target.id
    const node = graph.getElementData(id)
    console.log(node)
  })

  graph.on(ComboEvent.CLICK, (e) => {
    const id = e.target.id
    const node = graph.getElementData(id)
    console.log(node)
  })
  graph.render()
})

function appendChild() {
  const node = graph.getElementData('node4')
  if (!node) return
  const nodeMust = node as NodeData
  const newNode = {
    id: uniqueId() + '' + uniqueId(),
    style: {
      x: nodeMust.style!.x! + 30,
      y: nodeMust.style!.y! + 30
    }
  }
  graph.addChildrenData(node.id!, [newNode])

  graph.draw()
}

import CvsTest from './CvsTest.vue'
</script>

<template>
  <div style="display: flex; flex-direction: column">
    <h1>Example for drag a node into another combo, correctly delete the old edges</h1>
    <div id="container" style="width: 100%; height: 100%" />
    <button @click="appendChild">append a child</button>
  </div>
  <!-- <CvsTest /> -->
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
