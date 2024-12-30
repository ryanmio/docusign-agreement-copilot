"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserIcon } from "lucide-react";

interface TemplatePreviewProps {
  templateId: string;
  templateName: string;
  description: string;
  roles: Array<{
    roleName: string;
    roleId: string;
  }>;
  onProceed?: () => void;
  onBack?: () => void;
}

export function TemplatePreview({
  templateName,
  description,
  roles,
  onProceed,
  onBack,
}: TemplatePreviewProps) {
  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{templateName}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Required Signers:</h4>
        <div className="space-y-2">
          {roles.map((role) => (
            <div
              key={role.roleId}
              className="flex items-center space-x-2 text-sm text-gray-600"
            >
              <UserIcon className="h-4 w-4" />
              <span>{role.roleName}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back
          </Button>
        )}
        {onProceed && (
          <Button onClick={onProceed}>
            Proceed to Recipients
          </Button>
        )}
      </div>
    </Card>
  );
} 