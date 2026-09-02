'use client';
import { useAIIntentStore } from '../../../store/useAIIntentStore';
import { useSemanticDispatcher } from '../../../lib/api/useSemanticDispatcher';
import { RepresentationId, LessonPhase } from '../../../types/orchestration';
import { TeacherState } from '../../../types/teacher';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

export default function DevPlayground() {
  const { setRepresentation, setLessonPhase, setTeacherState, activeRepresentation, lessonPhase, teacherState, teacherMessage } = useAIIntentStore();
  const events = useSemanticDispatcher(state => state.events);

  return (
    <div className="min-h-screen bg-background p-12 overflow-y-auto flex gap-8">
      {/* Left: Controls */}
      <div className="w-1/2 flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dev Playground</h1>
          <p className="text-muted-foreground">Test orchestration states and AI intents manually.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Representation Engine</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {(['webgl', 'node', 'graph', 'timeline', 'diagram', 'manipulation', 'text'] as RepresentationId[]).map(rep => (
              <Button 
                key={rep} 
                variant={activeRepresentation === rep ? 'default' : 'outline'}
                onClick={() => setRepresentation(rep)}
              >
                {rep}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lesson Phase</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {(['Explain', 'Hypothesize', 'Construct', 'Observe', 'Resolve', 'Question', 'Evaluate'] as LessonPhase[]).map(phase => (
              <Button 
                key={phase} 
                variant={lessonPhase === phase ? 'default' : 'outline'}
                onClick={() => setLessonPhase(phase)}
              >
                {phase}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teacher State</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {(['idle', 'speaking', 'listening', 'thinking', 'teaching', 'waiting', 'celebrating', 'correcting', 'concerned', 'paused'] as TeacherState[]).map(state => (
                <Button 
                  key={state} 
                  size="sm"
                  variant={teacherState === state ? 'default' : 'outline'}
                  onClick={() => setTeacherState(state, teacherMessage || 'Updating state...')}
                >
                  {state}
                </Button>
              ))}
            </div>
            <input 
              className="bg-input/50 border border-white/10 rounded-md px-4 py-2"
              value={teacherMessage}
              onChange={e => setTeacherState(teacherState, e.target.value)}
              placeholder="Teacher dialogue..."
            />
          </CardContent>
        </Card>
      </div>

      {/* Right: Telemetry / Events */}
      <div className="w-1/2 flex flex-col gap-4">
        <h2 className="text-xl font-bold">Semantic Telemetry</h2>
        <div className="flex-1 bg-black/50 border border-white/10 rounded-2xl p-6 overflow-y-auto font-mono text-sm flex flex-col gap-2">
          {events.length === 0 ? (
            <span className="text-muted-foreground italic">Listening for events...</span>
          ) : (
            events.map((ev, i) => (
              <div key={i} className="text-primary pb-2 border-b border-white/5 last:border-0">
                {'>'} {JSON.stringify(ev)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
