import { describe, expect, it } from 'vitest'

import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
  it('renders the router outlet', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          RouterView: {
            template: '<main data-testid="router-view" />',
          },
        },
      },
    })

    expect(wrapper.find('[data-testid="router-view"]').exists()).toBe(true)
  })
})
