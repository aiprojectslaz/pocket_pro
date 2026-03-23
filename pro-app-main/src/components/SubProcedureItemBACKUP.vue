
<template>
  <div class="sub-procedure-item">
    <!-- Iterate over subProcedures -->
    <div v-for="sub in subProcedure" :key="sub.id">

      <!-- Only render if the ID matches -->
      <div v-if="sub.id === parseInt($route.params.id)">

        <h1>{{ sub.attributes.name }}</h1>

        <!-- Iterate over the description array -->
        <div v-for="(item, index) in sub.attributes.description" :key="index">

          <!-- Check if it's a heading -->
          <div v-if="item.type === 'heading'">
            <component :is="'h' + item.level">{{ item.children[0].text }}</component>
          </div>

          <!-- Check if it's a paragraph -->
          <div v-if="item.type === 'paragraph'">
            {{ item.children[0].text }}
          </div>

          <!-- Check if it's a list -->
          <div v-else-if="item.type === 'list'">

            <!-- check if its an UNORDERED LIST-->
            <ul v-if="item.format === 'unordered'">
              <li v-for="(listItem, i) in item.children" :key="i">

                <!-- Render the first child's text inside a <p> tag -->
                <p v-if="item.children.length > 0">{{ item.children[0].text }}</p>

                <!-- Render the list item text -->
                <div v-if="listItem.type === 'list-item'">
                  {{ listItem.children[0].text }}
                </div>

                <!-- Checking for nested list -->
                <ul v-if="listItem.type === 'list'">
                  <li v-for="(listItemX, x) in listItem.children" :key="x">

                    <!-- Render the text for nested list items -->
                    <div v-if="listItemX.children.length > 0">{{ listItemX.children[0].text }}</div>

                    <!-- Render nested nested lists -->
                    <ul v-if="listItemX.type === 'list'">
                      <li v-for="(listItemY, y) in listItemX.children" :key="y">

                        <!-- Render the text for nested nested list items -->
                        <div v-if="listItemY.children.length > 0">{{ listItemY.children[0].text }}</div>
                        <!-- Add more nesting levels if needed -->
                      </li>
                    </ul>
                  </li>
                </ul>

              </li>
            </ul>

            <!-- check if its an ORDERED LIST-->
            <ol v-if="item.format === 'ordered'">
              <li v-for="(listItem, i) in item.children" :key="i">

                <!-- Render the first child's text inside a <p> tag -->
                <p v-if="item.children.length > 0">{{ item.children[0].text }}</p>

                <!-- Render the list item text -->
                <div v-if="listItem.type === 'list-item'">
                  {{ listItem.children[0].text }}
                </div>

                <!-- Checking for nested list -->
                <ol v-if="listItem.type === 'list'">
                  <li v-for="(listItemX, x) in listItem.children" :key="x">

                    <!-- Render the text for nested list items -->
                    <div v-if="listItemX.children.length > 0">{{ listItemX.children[0].text }}</div>

                    <!-- Render nested nested lists -->
                    <ol v-if="listItemX.type === 'list'">
                      <li v-for="(listItemY, y) in listItemX.children" :key="y">

                        <!-- Render the text for nested nested list items -->
                        <div v-if="listItemY.children.length > 0">{{ listItemY.children[0].text }}</div>
                        <!-- Add more nesting levels if needed -->
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

  <!-- SUB-ROLES SECTION -->
    <div class="sub-roles">
      <ul>
        <li v-for="subRole in subRoles" :key="subRole.id">
          <RouterLink :to="{ name: 'subRole-item', params: { id: subRole.id } }">
            {{ subRole.attributes.role_title }}
          </RouterLink>
        </li>
      </ul>
    </div> <!-- .sub-procedures -->

</template>

<script>
import api from '@/services/api';
import axios from 'axios';

export default {
  name: 'SubProcedureItem',
  props: ['id'],
  data() {
    return {
      test: 0,
      subProcedure: [],
      subRoles: [], 
    };
  },
  mounted() {
    this.fetchSubProcedure(); 
  },
  methods: {
  
    fetchSubProcedure() {

      const id = this.$route.params.id;
      const index = this.$route.params.index;

      console.log('SubProcedure ID:', id); // Check if the ID is correct

      axios.get(`http://localhost:1337/api/sub-procedures`).then(response => {
        console.log('SubProcedure Data:', response.data.data); // Check if data is returned
        this.subProcedure = response.data.data;

      }).catch(error => {
        console.log("procedure-roles ERRROROROR")
        console.error('Error fetching sub-procedure:', error);
      });

    },
  }
  };
</script>
