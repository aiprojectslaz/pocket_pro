<template>
  <div class="definition-item">
    <!-- Iterate over Definitions -->
    <div v-for="def in definition" :key="def.id">

      <!-- Only render if the ID matches -->
      <div v-if="def.id === parseInt($route.params.id)">

        <!-- Title of the definition -->
        <h1 class="definition-title">{{ def.attributes.term }}</h1>

        <!-- Iterate over the definition content -->
        <div v-for="(item, index) in def.attributes.definition" :key="index">

          <!-- Check if it's a paragraph -->
          <div v-if="item.type === 'paragraph'" class="definition-paragraph">
            {{ item.children[0].text }}
          </div>

          <!-- Check if it's a list -->
          <div v-else-if="item.type === 'list'">

            <!-- Check if it's an UNORDERED LIST -->
            <ul v-if="item.format === 'unordered'" class="definition-list unordered-list">
              <li v-for="(listItem, i) in item.children" :key="i">

                <!-- Render the first child's text inside a <p> tag -->
                <p v-if="item.children.length > 0" class="list-item-text">{{ item.children[0].text }}</p>

                <!-- Render the list item text -->
                <div v-if="listItem.type === 'list-item'" class="list-item-text">
                  {{ listItem.children[0].text }}
                </div>

                <!-- Checking for nested list -->
                <ul v-if="listItem.type === 'list'" class="nested-list">
                  <li v-for="(listItemX, x) in listItem.children" :key="x">

                    <!-- Render the text for nested list items -->
                    <div v-if="listItemX.children.length > 0" class="list-item-text">{{ listItemX.children[0].text }}</div>

                    <!-- Render nested nested lists -->
                    <ul v-if="listItemX.type === 'list'" class="nested-list">
                      <li v-for="(listItemY, y) in listItemX.children" :key="y">

                        <!-- Render the text for nested nested list items -->
                        <div v-if="listItemY.children.length > 0" class="list-item-text">{{ listItemY.children[0].text }}</div>
                      </li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ul>

            <!-- Check if it's an ORDERED LIST -->
            <ol v-if="item.format === 'ordered'" class="definition-list ordered-list">
              <li v-for="(listItem, i) in item.children" :key="i">

                <!-- Render the first child's text inside a <p> tag -->
                <p v-if="item.children.length > 0" class="list-item-text">{{ item.children[0].text }}</p>

                <!-- Render the list item text -->
                <div v-if="listItem.type === 'list-item'" class="list-item-text">
                  {{ listItem.children[0].text }}
                </div>

                <!-- Checking for nested list -->
                <ol v-if="listItem.type === 'list'" class="nested-list">
                  <li v-for="(listItemX, x) in listItem.children" :key="x">

                    <!-- Render the text for nested list items -->
                    <div v-if="listItemX.children.length > 0" class="list-item-text">{{ listItemX.children[0].text }}</div>

                    <!-- Render nested nested lists -->
                    <ol v-if="listItemX.type === 'list'" class="nested-list">
                      <li v-for="(listItemY, y) in listItemX.children" :key="y">

                        <!-- Render the text for nested nested list items -->
                        <div v-if="listItemY.children.length > 0" class="list-item-text">{{ listItemY.children[0].text }}</div>
                      </li>
                    </ol>
                  </li>
                </ol>
              </li>
            </ol>
          </div>

          <!-- Additional checks for other types can go here -->

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.definition-item {
  padding: 20px;
}

.definition-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.definition-paragraph {
  margin-bottom: 15px;
  line-height: 1.6;
}

.definition-list {
  padding-left: 20px;
}

.unordered-list {
  list-style-type: disc;
}

.ordered-list {
  list-style-type: decimal;
}

.list-item-text {
  margin-bottom: 10px;
}

.nested-list {
  padding-left: 20px;
  margin-top: 5px;
}
</style>


<script>
import api from '@/services/api';

export default {
  name: 'DefinitionItem',
  props: ['id'],
  data() {
    return {
      test: 0,
      definition: [],
    };
  },
  mounted() {
    this.fetchdefinition(); 
  },
  methods: {
    fetchdefinition() {
      const id = this.$route.params.id;
      const index = this.$route.params.index;
      console.log('definition ID:', id); // Check if the ID is correct
      api.getDefinition(id).then(response => {
        this.definition = response.data ? [response.data] : [];
      }).catch(error => {
        console.error('Error fetching definition:', error);
      });
    },
  }
  };
</script>