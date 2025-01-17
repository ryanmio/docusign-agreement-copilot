"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { User } from "lucide-react";

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
    <Card className="w-full max-w-2xl mx-auto border-none shadow-[0_2px_4px_rgba(19,0,50,0.1)]">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-[#130032] tracking-[-0.02em] text-2xl font-semibold mb-2">
            {templateName}
          </h3>
          <p className="text-[#130032]/60 tracking-[-0.01em]">
            {description}
          </p>
        </div>

        {/* Signers */}
        {roles && roles.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-[#130032] font-medium">
              Required Signers:
            </h4>
            <div className="space-y-3">
              {roles.map((role) => (
                <div 
                  key={role.roleId}
                  className="flex items-center space-x-3"
                >
                  <div className="h-8 w-8 rounded-full bg-[#4C00FF]/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-[#4C00FF]" />
                  </div>
                  <span className="text-[#130032] font-medium">
                    {role.roleName}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Buttons */}
        {(onBack || onProceed) && (
          <div className="flex justify-end space-x-3 pt-4">
            {onBack && (
              <Button 
                variant="outline" 
                onClick={onBack}
                className="text-[#4C00FF] border-[#4C00FF] hover:bg-[#4C00FF]/10"
              >
                Back
              </Button>
            )}
            {onProceed && (
              <Button 
                onClick={onProceed}
                className="bg-[#4C00FF] hover:bg-[#4C00FF]/90 text-white"
              >
                Proceed to Recipients
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
} 