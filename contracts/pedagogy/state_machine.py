from enum import Enum
from typing import Dict, List

class TeachingState(str, Enum):
    IDLE = "IDLE"
    PLANNING = "PLANNING"
    TEACHING = "TEACHING"
    WAITING_FOR_STUDENT = "WAITING_FOR_STUDENT"
    EVALUATING = "EVALUATING"
    ADAPTING = "ADAPTING"
    COMPLETED = "COMPLETED"

class InvalidTransitionError(Exception):
    pass

class TeachingStateMachine:
    VALID_TRANSITIONS: Dict[TeachingState, List[TeachingState]] = {
        TeachingState.IDLE: [TeachingState.PLANNING],
        TeachingState.PLANNING: [TeachingState.TEACHING, TeachingState.COMPLETED],
        TeachingState.TEACHING: [TeachingState.WAITING_FOR_STUDENT, TeachingState.COMPLETED],
        TeachingState.WAITING_FOR_STUDENT: [TeachingState.EVALUATING],
        TeachingState.EVALUATING: [TeachingState.ADAPTING],
        TeachingState.ADAPTING: [TeachingState.TEACHING, TeachingState.PLANNING],
        TeachingState.COMPLETED: []
    }

    def __init__(self, initial_state: TeachingState = TeachingState.IDLE):
        self._current_state = initial_state

    @property
    def current_state(self) -> TeachingState:
        return self._current_state

    def transition_to(self, new_state: TeachingState):
        if new_state not in self.VALID_TRANSITIONS[self._current_state]:
            raise InvalidTransitionError(
                f"Cannot transition from {self._current_state} to {new_state}."
            )
        self._current_state = new_state

    def reset(self):
        self._current_state = TeachingState.IDLE
