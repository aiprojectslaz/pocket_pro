import { ref } from 'vue'

const isOpen = ref(false)
const modalContent = ref({ title: '', body: '', confirmLabel: 'OK' })

export function useModal() {
  function openModal({ title = '', body = '', confirmLabel = 'OK' } = {}) {
    modalContent.value = { title, body, confirmLabel }
    isOpen.value = true
  }

  function closeModal() {
    isOpen.value = false
  }

  return { isOpen, modalContent, openModal, closeModal }
}
