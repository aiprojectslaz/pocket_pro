<template>
  <div class="main-role-item">
    <!-- Iterate over mainRoles -->
    <div v-for="role in mainRoles" :key="role.id">

      <!-- Only render if the ID matches -->
      <div v-if="role.id === parseInt($route.params.id)">

        <h1>{{ role.attributes.name }}</h1>

        <!-- Iterate over the description array -->
        <div v-for="(item, index) in role.attributes.description" :key="index">

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


</template>

<script>
import api from '@/services/api';

export default {
  name: 'MainRoleItem',
  props: ['id'],
  data() {
    return {
      test: 0,
      procedure: [],
      mainRoles: [], 
    };
  },
  mounted() {
    this.fetchProcedure(); 
  },
  methods: {
  
    fetchProcedure() {

      const id = this.$route.params.id;
      const index = this.$route.params.index;

      console.log('Procedure ID:', id); // Check if the ID is correct

          api.getProcedure(id)
      .then(response => {
        if (response.data) {
          this.procedure = response.data;
          this.mainRoles = this.procedure.attributes.main_roles?.data || [];
            console.log('mainRoles ID:', this.mainRoles); // Check if the ID is correct


          // Ensure `attributes` and `main_roles` exist before accessing
          if (this.procedure.attributes && this.procedure.attributes.main_roles) {
            this.mainRoles = this.procedure.attributes.main_roles.data || []; // Fallback to empty array if data is missing
          } else {
            console.error('mainRoles data not found:', this.procedure);
            this.mainRoles = []; // Set to empty array to avoid errors
          }
        } else {
          console.error('Unexpected response format:', response.data);
          this.error = 'Failed to load procedure data.';
        }
      })
      .catch(error => {
        console.error('Error fetching procedure:', error);
        this.error = 'Failed to fetch procedure.';
      });

    },
  }
  };
</script>

