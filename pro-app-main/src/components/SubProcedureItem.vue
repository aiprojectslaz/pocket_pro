
<template>

<div class="sub-procedure-item container py-4">

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
            <ul v-if="item.format === 'unordered'" class="unordered-list">
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
            <ol v-if="item.format === 'ordered'" class="ordered-list">
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

    <div class="accordion accordion-borderless" id="mainRolesAccordion" v-if="subRoles.length">
      <div v-for="(role, index) in subRoles" :key="index" class="accordion-item">
      <!-- Accordion Header -->
        <h2 class="accordion-header" :id="`heading${index}`">
          <button
            class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="`#collapse${index}`" aria-expanded="false" :aria-controls="`collapse${index}`" >
            <span class="icon-spacing grey-icon"><fa icon="user-check"/></span> {{ role?.attributes.role_title }}
          </button>
        </h2>

      <!-- Accordion Body -->
        <div :id="`collapse${index}`"  class="accordion-collapse collapse" :aria-labelledby="`heading${index}`" data-bs-parent="#mainRolesAccordion" >
          <div class="accordion-body">
            <!-- Loop through the description array for each role -->
            <div v-for="(item, i) in role?.attributes?.description" :key="i">
              <!-- Check if it's a heading -->
              <div v-if="item.type === 'heading'">
                <component :is="'h' + item.level">{{ item.children[0].text }}</component>
              </div>

              <!-- Check if it's a paragraph -->
              <div v-if="item.type === 'paragraph'">
                <p>{{ item.children[0].text }}</p>
              </div>

              <!-- Check if it's a list -->
              <div v-else-if="item.type === 'list'">
                <!-- Unordered List -->
                <ul v-if="item.format === 'unordered'">
                  <li v-for="(listItem, i) in item.children" :key="i">
                    <div v-if="listItem.children.length > 0">{{ listItem.children[0].text }}</div>
                    <!-- Nested Unordered List -->
                    <ul v-if="listItem.type === 'list'">
                      <li v-for="(listItemX, x) in listItem.children" :key="x">
                        <div v-if="listItemX.children.length > 0">{{ listItemX.children[0].text }}</div>
                        <!-- Further nested lists -->
                        <ul v-if="listItemX.type === 'list'">
                          <li v-for="(listItemY, y) in listItemX.children" :key="y">
                            <div v-if="listItemY.children.length > 0">{{ listItemY.children[0].text }}</div>
                          </li>
                        </ul>
                      </li>
                    </ul>
                  </li>
                </ul>

                <!-- Ordered List -->
                <ol v-if="item.format === 'ordered'">
                  <li v-for="(listItem, i) in item.children" :key="i">
                    <div v-if="listItem.children.length > 0">{{ listItem.children[0].text }}</div>
                    <!-- Nested Ordered List -->
                    <ol v-if="listItem.type === 'list'">
                      <li v-for="(listItemX, x) in listItem.children" :key="x">
                        <div v-if="listItemX.children.length > 0">{{ listItemX.children[0].text }}</div>
                        <!-- Further nested lists -->
                        <ol v-if="listItemX.type === 'list'">
                          <li v-for="(listItemY, y) in listItemX.children" :key="y">
                            <div v-if="listItemY.children.length > 0">{{ listItemY.children[0].text }}</div>
                          </li>
                        </ol>
                      </li>
                    </ol>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</div>
</template>

<script>
import api from '@/services/api';
import api from '@/services/api';
import SubRolesItem from '@/components/SubRolesItem.vue';

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

      api.getSubProcedure(id).then(response => {
        if (response.data) {
          this.subProcedure = [response.data];
          this.subRoles = response.data.attributes.procedure_roles?.data || [];
        }
      }).catch(error => {
        console.error('Error fetching sub-procedure:', error);
      });

    },
  }
  };
  
</script>

<style scoped lang="scss">
.sub-procedure-item {
  h1, h2, h3 {
    margin-bottom: 15px;
  }
}

.accordion-item {
  margin-bottom: 1rem;
}

.accordion-button {
  background-color: #f8f9fa;
  font-size: 1.25rem;
  cursor: pointer;
  transition: background-color 0.3s ease;
  padding: 0.5rem 1rem; /* Adjust padding for smaller height */
}

.accordion-button:not(.collapsed) {
  background-color: #e9ecef;
}

.accordion-body {
  padding: 1rem;
  background-color: #fff;
  border: 1px solid #ddd;
  max-height: 200px; /* Adjust max-height to control visible content */
  overflow-y: auto; /* Adds a scrollbar if content exceeds max-height */
}

h3, h4 {
  margin-top: 0.5rem;
}
.icon-spacing {
  margin-right: 1.0rem; /* Adjust as needed */
}

.grey-icon .fa {
  color: grey; /* Adjust color as needed */
}




/* Remove borders from the accordion  <!-- BORDERLESS ACCORDION --> */
.accordion-borderless .accordion-button {
  border: none; /* Remove border around buttons */
  border-radius: 0; /* Remove border-radius if needed */
  box-shadow: none; /* Remove shadow if any */
}

/* Remove border from the accordion items */
.accordion-borderless .accordion-item {
  border: none; /* Remove border around accordion items */
}

/* Background color for the active item */
.accordion-borderless .accordion-button:not(.collapsed) {
  background-color: #f8f9fa; /* Change to desired background color */
  color: #333; /* Adjust text color if needed */
}

/* Optional: style for the header of the active item */
.accordion-borderless .accordion-button:not(.collapsed) .icon-spacing {
  color: #007bff; /* Adjust icon color if needed */
}
</style>


