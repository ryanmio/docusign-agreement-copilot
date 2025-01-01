import { FormState } from '../types/form';

export function createInitialState(roles: Array<{ roleName: string }>): FormState {
  return {
    status: 'initial',
    data: {
      recipients: roles.map(role => ({
        email: '',
        name: '',
        roleName: role.roleName,
        error: {}
      })),
      roles: roles.map(role => ({
        roleName: role.roleName,
        required: true
      }))
    },
    validation: {
      isValid: false,
      errors: {},
    },
    isDirty: false,
    isComplete: false
  };
} 