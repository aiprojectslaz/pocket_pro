<!-- HIDDING THIS LIST OF PROCEDURES - DO NOT NEED 2 OF THEM  ProcedureList.vue-->

  <div class="procedures-list">
    <h1>Procedures</h1>
    <ul>
      <li v-for="procedure in procedures" :key="procedure.id">
        <!-- Displaying procedure number + procedure name -->
        <RouterLink :to="`/procedure/${procedure.id}`"> {{ procedure.attributes.procedure_number }} - {{ procedure.attributes.name }} </RouterLink>
      </li>
    </ul>
  </div>



<!-- WORKING METHOD TO PULL PROCEDURAL DATA -->
    methods: {
    fetchProcedure() {
      axios.get(`http://localhost:1337/api/procedures/${this.id}`)
        .then(response => {
          // Check if response data is as expected
          if (response.data && response.data.data) {
            this.procedure = response.data.data;
            console.log(response,"WAJID!!!"); 
          } else {
            console.log(response,"WAJID-2"); 
            console.error('Unexpected response format:', response.data);
            this.error = 'Failed to load procedure data.';
          }
        })
        .catch(error => {
            console.log(error,"WAJID-3"); 
          console.error('Error fetching procedure:', error);
          this.error = 'Failed to fetch procedure.';
        });
    },
  },


  <!-- Sub procedure script intial draft -->
  <script>
import api from '@/services/api';
import axios from 'axios';

export default {
  name: 'SubProcedureItem',
  components: {
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
    data() {
      return {
        sub_procedures: [], // To store the related sub_procedures
        error: [],
      };
    },
    beforeMount() {
      this.fetchProcedure(); 
    },
    methods: {
    fetchProcedure() {
      axios.get(`http://localhost:1337/api/procedures/${this.id}?populate=sub_procedures`)
        .then(response => {
          // Check if response data is as expected
          if (response.data && response.data.data) {
            this.procedure = response.data.data;
            this.sub_procedures = this.procedure.attributes.sub_procedures.data;
            console.log(response,"OLIVIA!!!"); 
          } else {
            console.log(response,"OLIVIA-2"); 
            console.error('Unexpected response format:', response.data);
            this.error = 'Failed to load procedure data.';
          }
        })
        .catch(error => {
            console.log(error,"OLIVIA-3"); 
          console.error('Error fetching procedure:', error);
          this.error = 'Failed to fetch procedure.';
        });
    },
  },

};
</script>

<script>
import api from '@/services/api';
import axios from 'axios';

export default {
  name: 'SubProcedureItem',
  components: {
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
    data() {
      return {
        subProcedure: [], // To store the related sub_procedures
        error: [],
      };
    },
  beforeMount() {
    this.fetchSubProcedure(); //needs to beforeMount because define procedure as null line 71
  },
  methods: {
    fetchSubProcedure() {
      const id = this.$route.params.id;
      console.log('SubProcedure ID:', id); // Check if the ID is correct
      axios.get(`http://localhost:1337/api/sub-procedures`).then(response => {
        console.log('SubProcedure Data:', response.data); // Check if data is returned
        this.subProcedure = response.data;
      }).catch(error => {
        console.error('Error fetching sub-procedure:', error);
      });
    },
    },
};
</script>


<!-- Displaying sub procedure details -->
  <div>
    <!-- Iterate over subProcedures -->
    <div v-for="sub in subProcedure" :key="sub.id">
      <!-- Only render if the ID matches -->

      <div v-if="sub.id === parseInt($route.params.id)">
        <h1>{{ sub.attributes.name }}</h1>
        
        <!-- Displaying description or any other attribute dynamically -->
        <div v-for="(desc, index) in sub.attributes.description" :key="index">
          <p v-if="desc.children && desc.children.length">
            {{ desc.children[0].text }}
          </p>
        </div>
      </div>
    </div>
  </div>


<!-- Displaying sub procedure details -->
<div>
    <!-- Iterate over subProcedures -->
    <div v-for="sub in subProcedure" :key="sub.id">

      <!-- Only render if the ID matches -->
      <div v-if="sub.id === parseInt($route.params.id)">
        <h1>{{ sub.attributes.name }}</h1>

        <!-- Iterate over the description array -->
        <div v-for="(item, index) in sub.attributes.description" :key="index">
        
          <!-- Check if it's a paragraph -->
          <div v-if="item.type === 'paragraph'">
            <p>{{ item.children[0].text }}</p>
          </div>

          <!-- Check if it's a list -->
          <div v-else-if="item.type === 'list'">
            <ul v-if="item.format === 'unordered'">
              <li v-for="(listItem, i) in item.children" :key="i">
                {{ listItem.children[0].text }}
              </li>
            </ul>
            <ol v-else-if="item.format === 'ordered'">
              <li v-for="(listItem, i) in item.children" :key="i">
                {{ listItem.children[0].text }}
              </li>
            </ol>
          </div>

          <!-- Additional checks for other types can go here -->
        </div>
      </div>
    </div>
  </div>

    <div>
    <div v-for="item in definition" :key="item.id">
      <div v-if="item.id">
        {{ item.id }}: {{ item.attributes.term }}
      </div>
    </div>
  </div>


  PUT THIS BACK IN SUB PROCEDURES (SOLUTION WITH JESSICA!!!)

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
  
    async fetchSubProcedure() {

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
<template>
   <div>
    <!-- Iterate over subProcedures -->
    <div v-for="sub in subProcedure" :key="sub.id">

      <!-- Only render if the ID matches -->
      <div v-if="sub.id === parseInt($route.params.id)">
        <h1>{{ sub.attributes.name }}</h1>

        <!-- Iterate over the description array -->
        <div v-for="(item, index) in sub.attributes.description" :key="index">

          <!-- Check if it's a paragraph -->
          <div v-if="item.type === 'paragraph'">
            <p>{{ item.children[0].text }}</p>
          </div>

          <!-- Check if it's a list -->
          <div v-else-if="item.type === 'list'">
            <ul v-if="item.format === 'unordered'">
              <li v-for="(listItem, i) in item.children" :key="i">
                  <p v-if="listItem.type === 'list-item'">
                  {{ listItem.children[0].text }}
                  </p>
                  <!-- checking for nested list -->
                  <ul v-if="listItem.type === 'list'">
                    <li v-for="(listItemX, x) in listItem.children" :key="x">
                  {{ listItemX.children[0].text }}

                    <!-- checking for nested nested list -->

                  </li>
                  </ul>
              </li>
            </ul>
            <ol v-else-if="item.format === 'ordered'">
              <li v-for="(listItem, i) in item.children" :key="i">
                {{ listItem.children[0].text }}
              </li>
            </ol>
          </div>

          <!-- Additional checks for other types can go here -->



        </div>
      </div>
    </div>
  </div>


</template>



<!-- OLD MAIN ROLES SECTION -->

<!-- MAIN ROLES SECTION  -->
      <div class="main-roles" v-if="main_roles.length">
        <div v-for="(role, index) in main_roles" :key="index">
            <h3>{{ role?.attributes?.role_title }}</h3>
          <div v-for="(description, i) in role?.attributes?.description" :key="i">
            <div v-for="(child, j) in description?.children" :key="j">
              {{ child?.text }}
            </div>
          </div>
        </div>
      </div> <!-- .main-roles -->

<!-- OLD SUB ROLES SECTION -->

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

      <!-- SUB-ROLES NEW SECTION -->

     <div class="sub-roles" v-if="subRoles.length">
      <SubRolesItem v-for="role in subRoles" :subRoles="role" :key="role.id"></SubRolesItem>
    </div> <!-- .sub-roles -->



<!-- PROCEDURE LIST API CALL -->
        mounted(){
      axios.get('http://localhost:1337/api/procedures').then(response => {
        this.procedures = response.data.data;
        console.log(response.data.data);
      }).catch(error => {
        console.error('There was an error fetching the procedures:', error);
      });
    }


<!-- PROCEDURE LIST Template -->

  <div class="procedures-list">
    <h1>Procedures</h1>
    <ul>
      <li v-for="procedure in procedures" :key="procedure.id">
        <!-- Using dynamic route to link to the individual procedure page -->
        <RouterLink :to="{ name: 'procedure-item', params: { id: procedure.id } }">
          {{ procedure.attributes.procedure_number }} {{ procedure.attributes.name }}
        </RouterLink>
      </li>
    </ul>
  </div>

 mounted() {
      // Get the JWT token from the store
      const token = this.$store.state.jwt; // Access the JWT token from Vuex state
 },


 <!-- MAIN ROLES SECTION  -->

      <div class="main-roles" v-if="main_roles.length">
        <div v-for="(role, index) in main_roles" :key="index">
            <h3>{{ role?.attributes?.role_title }}</h3>
          <div v-for="(description, i) in role?.attributes?.description" :key="i">
            <div v-for="(child, j) in description?.children" :key="j">
              {{ child?.text }}
            </div>
          </div>
        </div>
      </div> <!-- .main-roles -->


            <div class="main-roles" v-if="main_roles.length">
        <ul>
          <li v-for="(role, index) in main_roles" :key="role.id">
            <RouterLink :to="{ name: 'mainRole-item', params: { id: role.id } }">
              {{ role?.attributes?.role_title }}
            </RouterLink>
          </li>
        </ul>
      </div>


        <!-- SUB-ROLES SECTION -->
    <div class="sub-roles">
      <ul>
        <li v-for="role in subRoles" :key="role?.id">
          <RouterLink :to="{ name: 'subRole-item', params: { id: role?.id } }">
            {{ role.attributes.role_title }}
          </RouterLink>
        </li>
      </ul>
    </div> <!-- .sub-procedures -->


    <!-- BOOK MARK SCRIPT - initial -->


<script>
import { bookmarksState } from '@/store/bookmarksState';
import axios from 'axios';

export default {
  data() {
    return {
      bookmarks: [], // Initialize with an empty array
      bookmarkedProcedures: [],
      procedure: []
    };
  },
  async mounted() {
    // Fetch the procedures based on the bookmarked IDs
    for (let id of bookmarksState.bookmarks) {
      // Example API request fetching only specific fields
      const response = await axios.get(`http://localhost:1337/api/procedures/${id}`, {
        params: {
          fields: ['procedure_number', 'name', 'status', 'issue_date', 'replaces_date', 'rationale'] // Only request these fields
        }
      });

    }
  },
  mounted() {
    this.fetchBookmarks();
  },
  methods: {
    fetchBookmarks() {
      // Fetch bookmarks from local storage or an API
      this.bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
      console.log(this.bookmarks);
    },
  },
  truncatedRationale(rationale){
    const lines = rationale.split('\n').slice(0, 2); // Get the first two lines
      return lines.join('\n'); // Join them back with a newline character
   }
};
</script>


<!-- login method -->

    async loginUser() {
      console.log('Login button clicked');
      try {
        // Request API.
        const response = await axios.post('http://localhost:1337/api/auth/local', {
          identifier: this.email,
          password: this.password,
        });

        // Handle success.
        //console.log('User profile', response.data.user);
        //console.log('User token', response.data.jwt);
        console.log('Login Success!');
        
        const jwt = response.data.jwt;
        authState.setJwt(jwt); // Set JWT in authState
      
        //this.$store.dispatch('login', jwt);
        this.$router.push('/');

        // Save JWT to localStorage to persist the session
        localStorage.setItem('jwt', jwt);

        // Redirect to home or another page
        this.$router.push('/');
      } catch (error) {
        // Handle error.
        console.log('Login failed:', error.response);
      }
    }
  


  <!-- STYLE PAGE FOR ProcedureList -->

  <template>

  <div class="procedures-list">
    <h1 class="text-center mb-4">Procedures</h1>
    <ul class="list-unstyled">
      <li v-for="procedure in procedures" :key="procedure.id" class="mb-3">
        <RouterLink :to="{ name: 'procedure-item', params: { id: procedure.id } }" class="d-block p-3 text-decoration-none text-dark bg-light rounded hover-effect">
          {{ procedure.attributes.procedure_number }} {{ procedure.attributes.name }}
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.procedures-list {
  max-width: 800px;
  margin: 0 auto;
  padding: 16px;
}

h1 {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 24px;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  margin-bottom: 12px;
}

li a {
  display: block;
  padding: 10px 15px;
  text-decoration: none;
  color: #333;
  background-color: #f8f9fa;
  border-radius: 4px;
  transition: background-color 0.2s;
}

li a:hover {
  background-color: #e2e6ea;
}

@media (max-width: 576px) {
  h1 {
    font-size: 20px;
  }

  li a {
    padding: 8px 12px;
  }
}
</style>




