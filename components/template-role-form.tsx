'use client';

import { useState, useEffect, useRef } from 'react';
import { TemplateResponse, TemplateRole } from '@/types/envelopes';

interface TemplateRoleFormProps {
  template: TemplateResponse;
  onSubmit: (roles: TemplateRole[]) => void;
  onCancel: () => void;
}

export function TemplateRoleForm({ template, onSubmit, onCancel }: TemplateRoleFormProps) {
  const [roles, setRoles] = useState<TemplateRole[]>(
    template.roles.map(role => ({
      roleName: role.roleName,
      email: role.defaultRecipient?.email || '',
      name: role.defaultRecipient?.name || '',
      routingOrder: role.signingOrder,
    }))
  );
  
  const isInitialMount = useRef(true);

  // Update parent component whenever roles change, but skip the initial mount
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onSubmit(roles);
  }, [roles, onSubmit]);

  const updateRole = (index: number, field: keyof TemplateRole, value: string | number) => {
    const newRoles = [...roles];
    newRoles[index] = { ...newRoles[index], [field]: value };
    setRoles(newRoles);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Assign Recipients</h3>
        <p className="text-sm text-gray-500">
          Fill in the details for each role in the template
        </p>
      </div>

      <div className="space-y-4">
        {roles.map((role, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-4">
            <div className="font-medium">{role.roleName}</div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={role.email}
                  onChange={(e) => updateRole(index, 'email', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={role.name}
                  onChange={(e) => updateRole(index, 'name', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border rounded-md"
                  placeholder="Enter full name"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
} 