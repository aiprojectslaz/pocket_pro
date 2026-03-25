<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-card" role="dialog" aria-modal="true" :aria-labelledby="titleId">
          <!-- Header -->
          <div class="modal-header">
            <h5 :id="titleId" class="modal-title">{{ modalContent.title }}</h5>
            <button class="modal-close" @click="closeModal" aria-label="Close">&times;</button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <slot>{{ modalContent.body }}</slot>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button class="btn btn-sm btn-outline-secondary" @click="closeModal">Cancel</button>
            <button class="btn btn-sm btn-brand" @click="closeModal">
              {{ modalContent.confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useModal } from '@/composables/useModal'

const { isOpen, modalContent, closeModal } = useModal()

// Stable aria id derived from title (falls back to generic)
const titleId = computed(() =>
  modalContent.value.title
    ? 'modal-title-' + modalContent.value.title.toLowerCase().replace(/\s+/g, '-')
    : 'modal-title'
)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.modal-card {
  background: #fff;
  border-radius: 10px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--brand-primary);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.4rem;
  line-height: 1;
  color: #9ca3af;
  cursor: pointer;
  padding: 0 0.25rem;
  &:hover { color: #374151; }
}

.modal-body {
  padding: 1.25rem;
  font-size: 0.9375rem;
  color: #374151;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem 1rem;
  border-top: 1px solid #e5e7eb;
}

.btn-brand {
  background: var(--brand-primary);
  color: #fff;
  border-color: var(--brand-primary);
  &:hover { opacity: 0.88; }
}

/* Transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: transform 0.2s ease;
}
.modal-enter-from .modal-card,
.modal-leave-to .modal-card {
  transform: translateY(-12px);
}
</style>
