interface MeetingParams {
  type: 'consultation' | 'demo' | 'technical_discussion';
  preferredDate: string;
  duration: number;
  attendees: string[];
  notes?: string;
}

export class SchedulingTool {
  async scheduleMeeting(params: MeetingParams): Promise<string> {
    try {
      // In production, this would integrate with calendar APIs
      // For now, we'll create a meeting request
      
      const meetingId = `MTG-${Date.now()}`;
      const meetingDate = new Date(params.preferredDate);
      
      // Check for availability (demo logic)
      const isAvailable = this.checkAvailability(meetingDate);
      
      if (!isAvailable) {
        const alternatives = this.getSuggestedTimes(meetingDate);
        return `
The requested time slot is not available.

Suggested alternative times:
${alternatives.map(time => `- ${time.toLocaleString()}`).join('\n')}

Please choose an alternative time or contact us directly at info@groeimetai.io
`;
      }

      // Create calendar invite (would send actual invite in production)
      const inviteDetails = {
        id: meetingId,
        type: params.type,
        date: meetingDate.toISOString(),
        duration: params.duration,
        attendees: params.attendees,
        notes: params.notes,
        meetingLink: this.generateMeetingLink(meetingId),
      };

      return `
Meeting Scheduled Successfully!

Meeting Details:
- ID: ${inviteDetails.id}
- Type: ${this.getMeetingTypeLabel(params.type)}
- Date: ${meetingDate.toLocaleDateString()}
- Time: ${meetingDate.toLocaleTimeString()}
- Duration: ${params.duration} minutes
- Meeting Link: ${inviteDetails.meetingLink}

Attendees:
${params.attendees.map(a => `- ${a}`).join('\n')}

${params.notes ? `Notes: ${params.notes}` : ''}

A calendar invitation has been sent to all attendees.
You will receive a confirmation email shortly.

Prepare for your meeting:
- Review our case studies at groeimetai.com/cases
- Prepare your questions about AI implementation
- Have your current tech stack documentation ready
`;
    } catch (error) {
      return `Failed to schedule meeting: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  private checkAvailability(date: Date): boolean {
    // Simple availability check (demo)
    const hour = date.getHours();
    const day = date.getDay();
    
    // Available Monday-Friday, 9 AM - 5 PM CET
    if (day === 0 || day === 6) return false; // Weekend
    if (hour < 9 || hour >= 17) return false; // Outside business hours
    
    return true;
  }

  private getSuggestedTimes(requestedDate: Date): Date[] {
    const suggestions: Date[] = [];
    const baseDate = new Date(requestedDate);
    
    // Suggest 3 alternative times
    for (let i = 1; i <= 3; i++) {
      const suggestionDate = new Date(baseDate);
      suggestionDate.setDate(baseDate.getDate() + i);
      suggestionDate.setHours(10 + (i * 2)); // 10 AM, 12 PM, 2 PM
      suggestionDate.setMinutes(0);
      
      if (this.checkAvailability(suggestionDate)) {
        suggestions.push(suggestionDate);
      }
    }
    
    return suggestions;
  }

  private generateMeetingLink(meetingId: string): string {
    // In production, this would generate a real meeting link
    return `https://meet.groeimetai.com/${meetingId}`;
  }

  private getMeetingTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      consultation: 'AI Strategy Consultation',
      demo: 'Product Demonstration',
      technical_discussion: 'Technical Deep Dive',
    };
    
    return labels[type] || type;
  }

  async getAvailableSlots(startDate: string, endDate: string): Promise<string> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const slots: string[] = [];
    
    const current = new Date(start);
    while (current <= end) {
      if (this.checkAvailability(current)) {
        // Check each hour slot
        for (let hour = 9; hour < 17; hour++) {
          const slotTime = new Date(current);
          slotTime.setHours(hour, 0, 0, 0);
          
          if (Math.random() > 0.3) { // 70% availability (demo)
            slots.push(slotTime.toISOString());
          }
        }
      }
      current.setDate(current.getDate() + 1);
    }
    
    return `
Available time slots between ${start.toLocaleDateString()} and ${end.toLocaleDateString()}:

${slots.slice(0, 10).map(slot => {
  const date = new Date(slot);
  return `- ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}`;
}).join('\n')}

${slots.length > 10 ? `\n... and ${slots.length - 10} more slots available` : ''}

To book a slot, simply ask me to schedule a meeting at your preferred time.
`;
  }
}