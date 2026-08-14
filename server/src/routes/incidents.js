import express from 'express';
import { 
  getIncidents, 
  getIncidentById, 
  createIncident, 
  updateIncident,
  deleteIncident,
  analyzeIncidentPreview
} from '../controllers/incidentController.js';

const router = express.Router();

router.get('/', getIncidents);
router.get('/:id', getIncidentById);
router.post('/analyze', analyzeIncidentPreview);
router.post('/', createIncident);
router.patch('/:id', updateIncident);
router.delete('/:id', deleteIncident);

export default router;
