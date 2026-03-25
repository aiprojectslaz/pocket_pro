<template>
  <div class="procedure-item container py-4">

  <div v-if="error">{{ error }}</div>
  <router-view />

  <!-- ── Procedure header card ─────────────────────────────────────── -->
  <div class="proc-header-card mb-4">

    <!-- Breadcrumb -->
    <nav class="proc-breadcrumb" aria-label="breadcrumb">
      <RouterLink to="/procedure-list" class="bc-link">Procedures</RouterLink>
      <span class="bc-sep">›</span>
      <span v-if="procedure?.attributes?.chapter?.title" class="bc-link bc-chapter">
        {{ procedure.attributes.chapter.title }}
      </span>
      <span v-if="procedure?.attributes?.chapter?.title" class="bc-sep">›</span>
      <span class="bc-current">
        {{ procedure?.attributes?.procedure_number }} {{ procedure?.attributes?.name }}
      </span>
    </nav>

    <!-- Title row -->
    <div class="d-flex align-items-center gap-2 mt-2 mb-1">
      <h1 class="proc-title mb-0">{{ procedure?.attributes?.procedure_number }} {{ procedure?.attributes?.name }}</h1>
      <span v-if="procedure?.attributes?.status === 'Amended'" class="proc-amended-badge">Amended</span>
    </div>

    <!-- Meta row -->
    <div class="proc-meta-row">
      <span v-if="procedure?.attributes?.issue_date">
        <strong>Issued:</strong> {{ procedure?.attributes?.issue_date }}
      </span>
      <span v-if="procedure?.attributes?.replaces_date">
        <strong>Replaces:</strong> {{ procedure?.attributes?.replaces_date }}
      </span>
      <span v-if="procedure?.attributes?.chapter?.title" class="proc-meta-chapter">
        {{ procedure.attributes.chapter.title }}
      </span>
    </div>

    <hr class="my-2" />

    <!-- Action row -->
    <div class="proc-action-row">
      <div class="proc-nav-btns">
        <button @click="goBack" class="btn btn-sm btn-outline-secondary">
          <fa icon="arrow-left" class="me-1" />Previous
        </button>
        <button @click="goToNextProcedure" class="btn btn-sm btn-outline-secondary">
          Next<fa icon="arrow-right" class="ms-1" />
        </button>
      </div>
      <div class="proc-action-btns">
        <button
          @click="toggleBookmark"
          v-if="isLoggedIn"
          class="btn btn-sm"
          :class="isBookmarked ? 'btn-brand' : 'btn-outline-brand'"
        >
          <fa :icon="isBookmarked ? 'bookmark' : ['far', 'bookmark']" class="me-1" />
          {{ isBookmarked ? 'Bookmarked' : 'Bookmark' }}
        </button>
      </div>
    </div>

  </div>
  <!-- ── end header card ───────────────────────────────────────────── -->

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
  import api from '@/services/api';
  import MainRoleItem from './MainRoleItem.vue';
  import { authState } from '@/store/authState';

export default {
  name: 'ProcedureItem',
  components: {
    MainRoleItem,
  },
  props: {
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      procedure: null,
      main_roles: [],
      subProcedures: [],
      definitions: [],
      appendices: [],
      isBookmarked: false,
      currentProcedureId: this.$route.params.id,
      error: null,
    };
  },
  computed: {
    isLoggedIn() {
      return authState.isLoggedIn;
    },
  },
  async created() {
    await this.fetchProcedure();
    if (this.isLoggedIn) {
      await this.fetchBookmarkStatus();
    }
  },
  watch: {
    '$route.params.id': {
      immediate: false,
      async handler(newId) {
        this.currentProcedureId = newId;
        await this.fetchProcedure();
        if (this.isLoggedIn) {
          await this.fetchBookmarkStatus();
        }
      }
    }
  },
  methods: {
    goBack() {
      this.$router.go(-1);
    },
    async goToNextProcedure() {
      try {
        const nextId = parseInt(this.currentProcedureId, 10) + 1;
        const response = await api.getProcedure(nextId);
        if (response.data) {
          this.$router.push({ name: 'procedure-item', params: { id: nextId } });
        } else {
          alert('No next procedure available.');
        }
      } catch (error) {
        alert('No next procedure available.');
      }
    },
    async fetchProcedure() {
      try {
        const response = await api.getProcedure(this.id);
        if (response.data) {
          this.procedure = response.data;
          this.definitions   = this.procedure.attributes.definitions?.data || [];
          this.subProcedures = this.procedure.attributes.sub_procedures?.data || [];
          this.appendices    = this.procedure.attributes.appendices?.data || [];
          this.main_roles    = this.procedure.attributes.main_roles?.data || [];
        } else {
          this.error = 'Failed to load procedure data.';
        }
      } catch (error) {
        console.error('Error fetching procedure:', error);
        this.error = 'Failed to fetch procedure.';
      }
    },
    async fetchBookmarkStatus() {
      try {
        this.isBookmarked = await api.isBookmarked(authState.user.id, this.id);
      } catch (error) {
        console.error('Error fetching bookmark status:', error);
      }
    },
    async toggleBookmark() {
      if (!this.isLoggedIn) {
        this.$router.push('/login');
        return;
      }
      if (this.isBookmarked) {
        await this.removeBookmark();
      } else {
        await this.addBookmark();
      }
    },
    async addBookmark() {
      try {
        await api.addBookmark(authState.user.id, this.id);
        this.isBookmarked = true;
      } catch (error) {
        console.error('Error adding bookmark:', error);
      }
    },
    async removeBookmark() {
      try {
        await api.removeBookmark(authState.user.id, this.id);
        this.isBookmarked = false;
      } catch (error) {
        console.error('Error removing bookmark:', error);
      }
    },
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

  /* ── Procedure header card ──────────────────────────────── */
  .proc-header-card {
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 1.25rem 1.5rem;
    border-left: 4px solid var(--brand-primary);
  }

  /* Breadcrumb */
  .proc-breadcrumb {
    font-size: 0.8rem;
    color: #6b7280;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.25rem;
  }

  .bc-link {
    color: var(--brand-primary);
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }

  .bc-chapter {
    color: #6b7280;
    pointer-events: none;
  }

  .bc-sep {
    color: #9ca3af;
  }

  .bc-current {
    color: #374151;
    font-weight: 500;
  }

  /* Title */
  .proc-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--brand-primary);
  }

  /* Amended badge */
  .proc-amended-badge {
    background: #fef3c7;
    color: #92400e;
    font-size: 0.7rem;
    font-weight: 600;
    padding: 2px 10px;
    border-radius: 999px;
    border: 1px solid #fcd34d;
    white-space: nowrap;
  }

  /* Meta row */
  .proc-meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.8rem;
    color: #6b7280;
    margin-bottom: 0.25rem;
  }

  .proc-meta-chapter {
    color: var(--brand-primary-muted);
    font-style: italic;
  }

  /* Action row */
  .proc-action-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .proc-nav-btns {
    display: flex;
    gap: 0.5rem;
  }

  .proc-action-btns {
    display: flex;
    gap: 0.5rem;
  }

  .btn-outline-brand {
    border-color: var(--brand-primary);
    color: var(--brand-primary);
    &:hover {
      background: var(--brand-primary);
      color: #fff;
    }
  }

  .btn-brand {
    background: var(--brand-primary);
    color: #fff;
    border-color: var(--brand-primary);
    &:hover { opacity: 0.88; }
  }
</style>

