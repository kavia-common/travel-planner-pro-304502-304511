#!/bin/bash
cd /home/kavia/workspace/code-generation/travel-planner-pro-304502-304511/travel_planner_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

