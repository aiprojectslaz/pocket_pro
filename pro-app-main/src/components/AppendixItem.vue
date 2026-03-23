<template>
  <div class="appendix-item">
    <!-- Iterate over Appendices -->
    <div v-for="item in appendix" :key="item.id">

      <!-- Only render if the ID matches -->
      <div v-if="item.id === parseInt($route.params.id)">

        <h1 class="appendix-title">{{ item.attributes.Name }}</h1>
        <h2 class="appendix-subtitle">{{ item.attributes.title }}</h2>
        <hr class="divider">

        <div class="appendix-ticker mb-3 d-flex justify-content-between">
          <div class="status">{{ item.attributes.status }}</div>
          <div class="issue-date"><strong>Issued:</strong> {{ item.attributes.issue_date }}</div>
          <div class="replaces-date"><strong>Replaces:</strong> {{ item.attributes.replaces_date }}</div>
        </div> <!-- .appendix-ticker -->

        <!-- Iterate over the description array -->
        <div v-for="(descItem, index) in item.attributes.description" :key="index" class="description-item">

          <!-- Check if it's a heading -->
          <div v-if="descItem.type === 'heading'">
            <component :is="'h' + descItem.level" class="description-heading">{{ descItem.children[0].text }}</component>
          </div>

          <!-- Check if it's a paragraph -->
          <div v-if="descItem.type === 'paragraph'" class="description-paragraph">
            {{ descItem.children[0].text }}
          </div>

          <!-- Check if it's a list -->
          <div v-else-if="descItem.type === 'list'">

            <!-- Check if it's an UNORDERED LIST -->
            <ul v-if="descItem.format === 'unordered'" class="description-list unordered-list">
              <li v-for="(listItem, i) in descItem.children" :key="i">

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
            <ol v-if="descItem.format === 'ordered'" class="description-list ordered-list">
              <li v-for="(listItem, i) in descItem.children" :key="i">

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
.appendix-item {
  padding: 20px;
}

.appendix-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 10px;
}

.appendix-subtitle {
  font-size: 20px;
  margin-bottom: 20px;
}

.divider {
  margin: 20px 0;
}

.appendix-ticker {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.status {
  font-weight: bold;
}

.issue-date, .replaces-date {
  margin-top: 5px;
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
import api from '@/services/api';

export default {
  name: 'AppendixItem',
  props: ['id'],
  data() {
    return {
      test: 0,
      appendix: [],
    };
  },
  mounted() {
    this.fetchappendix(); 
  },
  methods: {
    fetchappendix() {
      const id = this.$route.params.id;
      const index = this.$route.params.index;
      console.log('appendix ID:', id); // Check if the ID is correct
      api.getAppendix(id).then(response => {
        this.appendix = response.data ? [response.data] : [];
      }).catch(error => {
        console.error('Error fetching appendix:', error);
      });
    },
  }
  };
</script>

<style>
/* Ensure that the elements stay in the same row */
.appendix-ticker {
    display: flex;
    align-items: center;
}

/* Style the "Status" element */
.status {
    background-color: maroon;
    color: white;
    padding: 1px 10px; /* Add padding inside the box */
    border-radius: 15px; /* Make the corners rounded */
    font-weight: bold;
}

/* Optional: Add some spacing between the elements */
.appendix-ticker > div {
    margin-right: 10px;
}

/* Remove the margin on the last element */
.appendix-ticker > div:last-child {
    margin-right: 0;
}
</style>