import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/common/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import InfiniteGame from './pages/InfiniteGame';
import CollectionsList from './pages/CollectionsList';
import CollectionGame from './pages/CollectionGame';
import AdminQuestions from './pages/AdminQuestions';
import AdminQuestionEdit from './pages/AdminQuestionEdit';
import AdminQuestionCreate from './pages/AdminQuestionCreate';
import AdminCollections from './pages/AdminCollections';
import AdminCollectionEdit from './pages/AdminCollectionEdit';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/game" element={<InfiniteGame />} />
        <Route path="/collections" element={<CollectionsList />} />
        <Route path="/collections/:collectionId/play" element={<CollectionGame />} />
        <Route path="/admin/questions" element={<AdminQuestions />} />
        <Route path="/admin/questions/new" element={<AdminQuestionCreate />} />
        <Route path="/admin/questions/:questionId" element={<AdminQuestionEdit />} />
        <Route path="/admin/collections" element={<AdminCollections />} />
        <Route path="/admin/collections/:collectionId" element={<AdminCollectionEdit />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
