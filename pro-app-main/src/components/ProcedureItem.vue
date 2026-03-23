<template>
  <div class="procedure-item container py-4">

  <div class="buttons-row container py-4">
    <!-- Left-aligned buttons -->
    <div class="left-buttons">
      <button @click="goBack" class="btn btn-secondary btn-sm ">Back</button>
      <button @click="goToNextProcedure" class="btn btn-secondary btn-sm">Next Procedure</button>
    </div>

    <!-- Right-aligned Bookmark button -->
    <div class="right-buttons">
      <button @click="toggleBookmark" v-if="isLoggedIn" class="btn btn-outline-secondary btn-sm">
        {{ isBookmarked ? 'Remove from Bookmarks' : 'Add to Bookmarks' }}
      </button>
    </div>
  </div>

  <div v-if="error">{{ error }}</div>
  <router-view />

<!-- Ticker Section -->
      <h1 class="mb-3">{{ procedure?.attributes?.procedure_number }} {{ procedure?.attributes?.name }}</h1><hr>
      <div class="procedure-ticker mb-3 d-flex justify-content-between">
        <div class="status badge rounded-pill">{{ procedure?.attributes?.status }}</div>
        <div class="issue-date"><strong>Issued:</strong> {{ procedure?.attributes?.issue_date }}</div>
        <div class="replaces-date"><strong>Replaces:</strong> {{ procedure?.attributes?.replaces_date }}</div>
      </div>

<!-- Rationale & Supervision Section -->
    <div v-if="procedure?.attributes?.rationale"  class="rationale mb-4">
      <h2>Rationale</h2><hr>
      <p>{{ procedure?.attributes?.rationale }}</p>
    </div>

  <div v-if="procedure?.attributes?.supervision" class="supervision mb-4">
    <h2>Supervision</h2>
    <hr>
    <p>{{ procedure?.attributes?.supervision }}</p>
  </div>
    
  <div class="procedure-content">
    
<!-- PROCEDURES SECTION -->
    <h2>Procedure</h2><hr>
    <div class="procedure-info" v-if="procedure?.attributes?.procedure_info?.length">
      <div v-for="(info, index) in procedure?.attributes?.procedure_info" :key="index">
        <div v-for="(procedure_info, i) in procedure?.attributes?.procedure_info" :key="i">
          <div v-for="(child, j) in procedure_info?.children" :key="j">
            {{ child?.text }}
          </div>
        </div>
      </div>
    </div> <!-- .procedure-info -->

<!-- MAIN ROLES SECTION  -->
 
  <div class="accordion accordion-borderless" id="mainRolesAccordion" v-if="main_roles.length">
    <div v-for="(role, index) in main_roles" :key="index" class="accordion-item">
    <!-- Accordion Header -->
      <h2 class="accordion-header" :id="`heading${index}`">
        <button
          class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="`#collapse${index}`" aria-expanded="false" :aria-controls="`collapse${index}`" >
          <span class="icon-spacing grey-icon"><fa icon="user-check"/></span> {{ role?.attributes?.role_title }}
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
   
<!-- SUB-PROCEDURES SECTION -->
    <div class="sub-procedures mt-4">
      <!-- <h3>Sub-Procedures</h3><hr> HIDE TITLE-->
      <ul class="no-bullets">
        <li v-for="subProcedure in subProcedures" :key="subProcedure.id">
          <RouterLink :to="{ name: 'subProcedure-item', params: { id: subProcedure.id } }" class="link-style">
            <fa class="icon-spacing" icon="list"/> {{ subProcedure.attributes.name }}
          </RouterLink>
        </li>
      </ul>
    </div> <!-- .sub-procedures -->

  </div> <!-- .procedure-content -->

<!-- Supplementary Information Section -->
    <div v-if="procedure?.attributes?.governing_authority.length || procedure?.attributes?.associated_governance.length" class="mb-4">
    <div>
      <!-- Supplementary Information Header -->
      <h2>Supplementary Information</h2>
      <hr>

      <!-- Accordion for Governing Authority -->
      <div class="accordion mb-4" id="governingAuthorityAccordion">
        <div class="accordion-item">
          <h2 class="accordion-header" id="governingAuthorityHeading">
            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#governingAuthorityCollapse" aria-expanded="false" aria-controls="governingAuthorityCollapse">
              Governing Authority
            </button>
          </h2>
          <div id="governingAuthorityCollapse" class="accordion-collapse collapse" aria-labelledby="governingAuthorityHeading" data-bs-parent="#governingAuthorityAccordion">
            <div class="accordion-body">
              <div v-for="(authority, index) in procedure?.attributes?.governing_authority" :key="index" class="mb-3">
                <p>{{ authority?.children[0]?.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Accordion for Associated Governance -->
      <div class="accordion" id="associatedGovernanceAccordion">
        <div class="accordion-item">
          <h2 class="accordion-header" id="associatedGovernanceHeading">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#associatedGovernanceCollapse" aria-expanded="false" aria-controls="associatedGovernanceCollapse">
              Associated Governance
            </button>
          </h2>
          <div id="associatedGovernanceCollapse" class="accordion-collapse collapse" aria-labelledby="associatedGovernanceHeading" data-bs-parent="#associatedGovernanceAccordion">
            <div class="accordion-body">
              <div v-for="(authority, index) in procedure?.attributes?.associated_governance" :key="index" class="mb-3">
                <p>{{ authority?.children[0]?.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>

<!-- Definitions Section -->
      <h3>Definitions</h3>
      <div class="accordion accordion-borderless" id="definitionsAccordion" v-if="definitions.length">
          <div v-for="(def, index) in definitions" :key="index" class="accordion-item">
          <!-- Accordion Header -->
            <h2 class="accordion-header" :id="`heading${index}`">
              <button
                class="accordion-button collapsed" type="button" data-bs-toggle="collapse" :data-bs-target="`#collapse${index}`" aria-expanded="false" :aria-controls="`collapse${index}`" >
                <span class="icon-spacing grey-icon"><fa icon="bookmark"/></span> {{ def.attributes?.term }}
              </button>
            </h2>

          <!-- Accordion Body -->
            <div :id="`collapse${index}`"  class="accordion-collapse collapse" :aria-labelledby="`heading${index}`" data-bs-parent="#definitionsAccordion" >
              <div class="accordion-body">

                <!-- Loop through the definition array for each item -->
                <div v-for="(item, i) in def.attributes?.definition" :key="i">
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

      <!-- Appendices Section -->
      <h3 v-if="appendices.length">Appendices</h3>
      <ul class="list-group list-group-flush">
        <li v-for="appendix in appendices" :key="appendix.id" class="list-group-item">
          <RouterLink :to="{ name: 'appendix-item', params: { id: appendix.id } }">
            {{ appendix?.attributes?.Name }}
          </RouterLink>
        </li>
      </ul>
      

  </div>
</template>

<script>
  import axios from 'axios';
  import api from '@/services/api';
  import MainRoleItem from './MainRoleItem.vue'; // Import your component
  import { mapState } from 'vuex';
  import { authState } from '@/store/authState'; // Auth state management
  import { bookmarksState } from '@/store/bookmarksState'; // Bookmark state management

export default {
  name: 'ProcedureItem',
    components: {
      MainRoleItem, // Register the component
  },
  props: {
    //procedure: Object, // added for bookmark but procedure is already defined
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      procedure: [], // Initialize as null to handle loading state
      chapter: [], // To store the related chapter
      main_roles: [], // To store the related chapter
      subProcedures: [], // To store the related sub_procedures
      definitions: [], // To store the related definitions
      appendices: [], // To store the related appendices
      userBookmarks: [], // User's current bookmarks
      isBookmarked: false, // Track if the current procedure is bookmarked
      currentProcedureId: this.$route.params.id,
      error: null,
    };
  },
  computed: {
      isLoggedIn() {
        return authState.isLoggedIn;
        //return this.$store.state.isLoggedIn;
      },
    },
    async created() {
      await this.fetchUserBookmarks();
    },
  watch: {
    id(newId) {
        this.fetchProcedure(); // Re-fetch procedure data when `id` changes
    },
    // Watch for changes in userBookmarks to update `isBookmarked`
    userBookmarks: {
      immediate: true,
      handler(newBookmarks) {
        this.isBookmarked = newBookmarks.some(bookmark => bookmark.id === this.procedureId);
      },
    },
    '$route.params.id': {
      immediate: true,
      handler(newId) {
        this.currentProcedureId = newId;  // Update currentProcedureId when route changes
        this.fetchProcedure();            // Fetch new procedure data
      }
    }
},
  beforeMount() {
    this.fetchProcedure(); //needs to beforeMount because define procedure as null line 71
  },
    mounted() {
    // Set initial state for `isBookmarked` based on the bookmarks passed to the component
    this.isBookmarked = this.userBookmarks.some(bookmark => bookmark.id === this.procedureId);
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    async goToNextProcedure() {
        try {
          const currentId = parseInt(this.currentProcedureId, 10);
          const nextId = currentId + 1;

          // Fetch the next procedure data
          const response = await axios.get(`http://localhost:1337/api/procedures/${nextId}?populate=definitions,sub_procedures,appendices,main_roles`);

          // Check if the response has data, otherwise alert
          if (response.data && response.data.data) {
            // Navigate to the next procedure if it exists
            this.$router.push({ name: 'procedure-item', params: { id: nextId } });
          } else {
            // Trigger the alert if no next procedure is available
            alert('No next procedure available.');
          }
        } catch (error) {
          // Check if the error is a 404 (not found) and alert the user
          if (error.response && error.response.status === 404) {
            alert('No next procedure available.');
          } else {
            console.error('Error fetching next procedure:', error);
            this.error = 'Failed to fetch the next procedure.';
          }
        }
      },
    async fetchProcedure() {
      axios.get(`http://localhost:1337/api/procedures/${this.id}?populate=definitions,sub_procedures,appendices,main_roles`)
      
        .then(response => {
          // Check if response data is as expected
          if (response.data && response.data.data) {
            this.procedure = response.data.data;
            this.definitions = this.procedure.attributes.definitions?.data;
            this.subProcedures = this.procedure.attributes.sub_procedures?.data;
            this.appendices = this.procedure.attributes.appendices?.data;
            this.main_roles = this.procedure.attributes.main_roles?.data;
            console.log('This Procedure:', this.procedure);

            //console.log('Main Roles Data:', this.main_roles)
            //const allRoleTitles = this.main_roles.map(item => item.attributes.role_title);
            //console.log(allRoleTitles);
            
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
    async fetchUserBookmarks() {
        const jwt = localStorage.getItem('jwt');

        if (!jwt) {
          console.log('User is not logged in');
          this.$router.push('/login');
          return;
        }

        try {
          const userBookmarkIdURL = 'http://localhost:1337/api/users/me?populate=bookmarks';
          const userBookmarkIdResponse = await fetch(userBookmarkIdURL, {
            headers: {
              'Authorization': `Bearer ${jwt}`
            }
          });

          if (!userBookmarkIdResponse.ok) {
            throw new Error('Network response was not ok');
          }

          const userBookmarkIdData = await userBookmarkIdResponse.json();
          const userBookmarksData = userBookmarkIdData.bookmarks || []; // Ensure bookmarks is an array
          this.userBookmarkIds = userBookmarksData.map(bookmark => bookmark.id);
          //console.log('this.userBookmarkIds:', this.userBookmarkIds[0]); // Log the bookmark IDs

          // Use the first bookmark ID to fetch bookmark data
          if (this.userBookmarkIds.length > 0) {

            const bookmarkId = this.userBookmarkIds[0];
                      const bookmarkDataURL = `http://localhost:1337/api/bookmarks?filters[id][$eq]=${bookmarkId}&populate=*`;

        // Fetch bookmark data
        const bookmarkDataResponse = await fetch(bookmarkDataURL, {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });
        if (!bookmarkDataResponse.ok) {
        throw new Error('Network response was not ok');
      }
          // Parse the JSON data
            const bookmarkData = await bookmarkDataResponse.json();
            this.userBookmarks = bookmarkData.data[0].attributes.procedures.data;
            //console.log('this.userBookmarks:', this.userBookmarks);

            } else {
              this.userBookmarks = [];
              console.log('No bookmarks found.');
            }
          } catch (error) {
            console.error('Error fetching bookmarks:', error);
            this.error = 'Error fetching bookmarks. Please try again later.';
          }
    },
    async toggleBookmark() {
      //console.log(this.isBookmarked);
      //console.log('this.id:', this.id);
      //console.log('this.userBookmarkIds:', this.userBookmarkIds[0]); // Log the bookmark IDs
      //console.log('this.userBookmarks:', this.userBookmarks[0]);
      
      //console.log(Array.isArray(this.userBookmarks)); // Should log true
      //console.log(this.userBookmarks.length); // Should show the number of bookmarks
      //this.userBookmarks.forEach(bookmark => console.log(bookmark.id));
      //console.log(this.userBookmarks.some(bookmark => bookmark.id === Number(this.id)));

    if (this.isBookmarked) {
      this.removeBookmark(); // Procedure is already bookmarked, so remove it
      //this.isBookmarked = false; // or use an update method to re-fetch the state
    } else {
      this.addBookmark(); // Procedure is not bookmarked, so add it
      //this.isBookmarked = true; // or use an update method to re-fetch the state
    }
     // Update button state????
      //this.isBookmarked = this.userBookmarks.some(bookmark => bookmark.id === this.procedure.id);
      // Update local state????
      // this.isBookmarked = !this.isBookmarked;
      //this.userBookmarks = updatedBookmarks;
      const bookmarkAction = this.isBookmarked ? 'remove' : 'add';
      const updatedBookmarks = this.isBookmarked
        ? this.userBookmarks.filter(bookmarkId => bookmarkId !== this.id)
        : [...this.userBookmarks, this.id];
  },
  async addBookmark(userBookmarkIds) {
    const id = this.userBookmarkIds[0];
    //console.log('this.userBookmarkIds:', id); 
    //console.log('this.procedure.id:', this.procedure.id); 

    try {
      // Ensure JWT is available
      const user = localStorage.getItem('username');
      console.log('user:', user);
      const jwt = localStorage.getItem('jwt');
      if (!jwt) {
        console.log('User is not logged in');
        this.$router.push('/login');
        return;
      }

      // Add the current procedure's ID to the bookmarks array
      const updatedBookmarks = [...this.userBookmarks, { id: this.procedure.id }];

      // Update the user's bookmarks on the server  
      const response = await fetch(`http://localhost:1337/api/bookmarks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify({
          data: {
            procedures: updatedBookmarks.map(bookmark => bookmark.id)  // Update the procedures array or bookmarks field
          }
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Update the local state with the new bookmarks
      this.isBookmarked = true;
      //this.userBookmarks = updatedBookmarks;
      console.log('Bookmark added successfully');
      console.log(this.userBookmarks);
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  },
    async removeBookmark(userBookmarkIds) {
      const id = this.userBookmarkIds[0];
      //console.log('this.userBookmarkIds:', id);
          
      // Filter out the current procedure's ID from the bookmarks array
      const updatedBookmarks = this.userBookmarks.filter(bookmark => bookmark.id !== this.procedure.id);

      try {
        // Ensure JWT is available
        const jwt = localStorage.getItem('jwt');
        if (!jwt) {
          console.log('User is not logged in');
          this.$router.push('/login');
          return;
        }

        // Update the user's bookmarks on the server
        const response = await fetch(`http://localhost:1337/api/bookmarks/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
          body: JSON.stringify({
            data: {
              procedures: updatedBookmarks.map(bookmark => bookmark.id)  // Send only the IDs of the remaining bookmarks
            }
          })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        // Update the local state with the new bookmarks
        this.isBookmarked = false;
        this.userBookmarks = updatedBookmarks;
        console.log('Bookmark removed successfully');
      } catch (error) {
        console.error('Error removing bookmark:', error);
      }
    }

  }
};
</script>

<style scoped lang="scss">

  .procedure-item {
    h1, h2, h3 {
      margin-bottom: 15px;
    }

    .procedure-ticker {
      .status {
        font-weight: bold;
        padding: 5px 10px;
      }
    }

    .procedure-content, .main-roles, .supplementary-info {
      hr {
        margin-bottom: 20px;
      }

      p, ul, ol {
        margin-bottom: 10px;
      }
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

  .procedure-ticker {
    margin-bottom: 20px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
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


  .card {
    .card-body {
      padding: 1.5rem; // Adjust padding as needed
    }

    h1 {
      font-size: 1.5rem; // Adjust font size as needed
    }

    .procedure-ticker {
      .status {
        font-weight: bold;
        padding: 5px 10px;
      }

      .issue-date,
      .replaces-date {
        font-size: 1rem; // Adjust font size as needed
      }
    }
  }

  .link-style {
    text-decoration: none; /* Remove underline */
    color: inherit; /* Inherit color from parent */
    display: flex; /* Align icon and text in a row */
    align-items: center; /* Center icon and text vertically */
  }

  /* Optionally, add styles for hover state */
  .link-style:hover {
    color: #007bff; /* Change to desired color on hover */
  }

  /* Remove list dots or bullets */
  .no-bullets {
    list-style-type: none; /* Removes default list item bullets */
    padding-left: 0; /* Removes padding to align list items with the container */
    margin-left: 0; /* Removes margin to align list items with the container */
  }

  /* Optional: Add custom styles for list items */
  .no-bullets li {
    margin-bottom: 0.5rem; /* Add spacing between list items */
  }

  .buttons-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  /* Left buttons (Back & Next Procedure) */
  .left-buttons {
    display: flex;
    gap: 10px; /* Adds space between the Back and Next buttons */
  }

  /* Right button (Bookmark Toggle) */
  .right-buttons {
    display: flex;
  }
</style>

