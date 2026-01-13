'use client';

import React from 'react';
import { useTeamData } from '@/hooks/useTeamData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface TeamDataValidatorProps {
  className?: string;
}

export const TeamDataValidator: React.FC<TeamDataValidatorProps> = ({ className }) => {
  const {
    teamMembers,
    consultants,
    admins,
    isLoading,
    error,
    getAvailableConsultants,
  } = useTeamData({
    roles: ['admin', 'consultant', 'client'],
    includeAvailability: true,
    realTime: true,
  });

  if (isLoading) {
    return (
      <Card className={`bg-white/5 border-white/10 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin h-4 w-4 text-orange" />
            <span className="text-white/60">Validating team data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`bg-red-500/10 border-red-500/20 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-400">Error loading team data: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Validation checks
  const validations = [
    {
      name: 'Real user data loaded',
      status: teamMembers.length > 0,
      message: `${teamMembers.length} team members found`,
    },
    {
      name: 'No fake emails present',
      status: !teamMembers.some(member => member.email.includes('@groeimetai.io')),
      message: teamMembers.filter(member => member.email.includes('@groeimetai.io')).length > 0 
        ? 'Fake emails detected' 
        : 'No fake emails found',
    },
    {
      name: 'Role-based filtering working',
      status: teamMembers.every(member => ['admin', 'consultant', 'client'].includes(member.role)),
      message: `Roles: ${Array.from(new Set(teamMembers.map(m => m.role))).join(', ')}`,
    },
    {
      name: 'Consultants available',
      status: consultants.length > 0,
      message: `${consultants.length} consultants found`,
    },
    {
      name: 'Admin users found',
      status: admins.length > 0,
      message: `${admins.length} admins found`,
    },
    {
      name: 'Availability data present',
      status: teamMembers.some(member => member.availability?.status),
      message: `${teamMembers.filter(m => m.availability?.status).length} members with availability`,
    },
    {
      name: 'Skills data present',
      status: teamMembers.some(member => member.skills && member.skills.length > 0),
      message: `${teamMembers.filter(m => m.skills && m.skills.length > 0).length} members with skills`,
    },
    {
      name: 'Photo URLs sanitized',
      status: teamMembers.every(member => 
        !member.photoURL || 
        (typeof member.photoURL === 'string' && member.photoURL.startsWith('http'))
      ),
      message: `${teamMembers.filter(m => m.photoURL).length} members have photos`,
    },
  ];

  const passedValidations = validations.filter(v => v.status).length;
  const totalValidations = validations.length;
  const allPassed = passedValidations === totalValidations;

  return (
    <Card className={`${allPassed ? 'bg-green-500/10 border-green-500/20' : 'bg-yellow-500/10 border-yellow-500/20'} ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {allPassed ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-yellow-500" />
          )}
          Team Data Validation
          <Badge variant="outline" className={allPassed ? 'text-green-400' : 'text-yellow-400'}>
            {passedValidations}/{totalValidations}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {validations.map((validation, index) => (
          <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
            {validation.status ? (
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className={`text-sm font-medium ${validation.status ? 'text-green-400' : 'text-red-400'}`}>
                {validation.name}
              </p>
              <p className="text-xs text-white/60">{validation.message}</p>
            </div>
          </div>
        ))}

        {/* Sample consultant matching test */}
        <div className="mt-4 p-3 bg-white/5 rounded-lg">
          <h4 className="text-sm font-medium text-white mb-2">Consultant Matching Test</h4>
          <div className="space-y-1">
            {['JavaScript', 'React', 'ServiceNow'].map(skill => {
              const matches = getAvailableConsultants([skill]);
              return (
                <div key={skill} className="flex justify-between text-xs">
                  <span className="text-white/60">{skill}:</span>
                  <span className="text-white">{matches.length} consultants</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamDataValidator;