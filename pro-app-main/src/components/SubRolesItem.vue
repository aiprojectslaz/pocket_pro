
<template>
  <div class="sub-role-item">
    
    <h1 class="role-title">{{ subRole?.attributes?.role_title }}</h1>
 
    <!-- Iterate over the description array -->
    <div v-for="(item, index) in subRole?.attributes?.description" :key="index" class="description-item">

      <!-- Check if it's a heading -->
      <div v-if="item.type === 'heading'">
        <component :is="'h' + item.level" class="description-heading">{{ item.children[0].text }}</component>
      </div>

      <!-- Check if it's a paragraph -->
      <div v-if="item.type === 'paragraph'" class="description-paragraph">
        {{ item.children[0].text }}
      </div>

      <!-- Check if it's a list -->
      <div v-else-if="item.type === 'list'">

        <!-- Check if it's an UNORDERED LIST -->
        <ul v-if="item.format === 'unordered'" class="description-list unordered-list">
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
        <ol v-if="item.format === 'ordered'" class="description-list ordered-list">
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
    </div>
  </div>
</template>


<style scoped>
.sub-role-item {
  padding: 20px;
}

.role-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.description-item {
  margin-bottom: 20px;
}

.description-heading {
  margin-bottom: 10px;
}

.description-paragraph {
  margin-bottom: 15px;
  line-height: 1.6;
}

.description-list {
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
}
</style>


<script>
import api from '@/services/api';
import axios from 'axios';

export default {
  name: 'SubRolesItem',
  props: ['id'],
  data() {
    return {
      subRole: [], 
    };
  },
  mounted() {
    this.fetchSubRoles(); 
  },
  methods: {
  
    async fetchSubRoles() {

      const id = this.$route.params.id;
      const index = this.$route.params.index;

      console.log('SubRole ID:', id); // Check if the ID is correct

      axios.get(`http://localhost:1337/api/procedure-roles/${id}`)
  .then(response => {
    console.log('Sub Role Data:', response.data.data); // Check if data is returned
    this.subRole = response.data.data; 
  })
  .catch(error => {
    console.error('Error fetching procedure role (sub_role):', error);
  });


    },
  }
  };
</script>
