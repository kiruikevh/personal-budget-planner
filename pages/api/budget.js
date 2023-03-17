import dbConnect from '../../utils/sedd';
import { Budget } from '../../models/Budget';
import { User } from '../../models/User';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const session = await getSession({ req });
        if (!session) {
          return res.status(401).json({ message: 'Not authenticated' });
        }

        const user = await User.findOne({ email: session.user.email });
        const budget = await Budget.findOne({ user: user._id });

        if (!budget) {
          return res.status(404).json({ message: 'Budget not found' });
        }

        res.status(200).json(budget);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
      }
      break;
    case 'POST':
      try {
        const authSession = await getSession({ req });
        if (!authSession) {
          return res.status(401).json({ message: 'Not authenticated' });
        }

        const user = await User.findOne({ email: authSession.user.email });
        const budget = new Budget({
          budget: req.body.budget,
          user: user._id,
        });

        await budget.save();

        res.status(201).json({ message: 'Budget saved successfully' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error saving budget' });
      }
      break;
    case 'PUT':
      try {
        const authSession = await getSession({ req });
        if (!authSession) {
          return res.status(401).json({ message: 'Not authenticated' });
        }

        const user = await User.findOne({ email: authSession.user.email });
        const budget = await Budget.findOne({ user: user._id });

        if (!budget) {
          return res.status(404).json({ message: 'Budget not found' });
        }

        budget.budget = req.body.budget;

        await budget.save();

        res.status(200).json({ message: 'Budget updated successfully' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating budget' });
      }
      break;
    default:
      res.status(405).json({ message: 'Method not allowed' });
  }
}
