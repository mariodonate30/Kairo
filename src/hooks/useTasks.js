import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'

export const PRIORITIES = ['baja', 'media', 'alta']

// Volumen esperado bajo (un estudiante tiene pocas tareas), así que cargamos
// todas sus tareas de una vez y filtramos por fecha en el cliente. Esto
// simplifica el calendario: cambiar de mes/semana no dispara nuevas consultas.
export function useTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    if (!user) return

    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      setError('No se han podido cargar tus tareas.')
    } else {
      setTasks(data || [])
    }

    setLoading(false)
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  // Tareas agrupadas por fecha de entrega ('YYYY-MM-DD' → array de tareas),
  // para que el calendario pueda pintar cada día sin recorrer todo el listado.
  const tasksByDate = useMemo(() => {
    const map = new Map()
    for (const task of tasks) {
      if (!map.has(task.due_date)) map.set(task.due_date, [])
      map.get(task.due_date).push(task)
    }
    // Dentro de cada día: pendientes antes que completadas, y por prioridad.
    const rank = { alta: 0, media: 1, baja: 2 }
    for (const list of map.values()) {
      list.sort((a, b) => {
        if (a.completed !== b.completed) return a.completed ? 1 : -1
        return rank[a.priority] - rank[b.priority]
      })
    }
    return map
  }, [tasks])

  async function addTask({ title, description, subject, dueDate, priority }) {
    const cleanTitle = title.trim()
    if (!user || !cleanTitle) return { error: new Error('Título vacío') }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: cleanTitle,
        description: description?.trim() || null,
        subject: subject?.trim() || null,
        due_date: dueDate,
        priority: PRIORITIES.includes(priority) ? priority : 'media',
      })
      .select()
      .single()

    if (!error && data) {
      setTasks((prev) => [...prev, data])
    }

    return { error }
  }

  async function updateTask(task, { title, description, subject, dueDate, priority }) {
    const cleanTitle = title.trim()
    if (!cleanTitle) return { error: new Error('Título vacío') }

    const patch = {
      title: cleanTitle,
      description: description?.trim() || null,
      subject: subject?.trim() || null,
      due_date: dueDate,
      priority: PRIORITIES.includes(priority) ? priority : 'media',
    }

    const previous = tasks
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...patch } : t)))

    const { error } = await supabase.from('tasks').update(patch).eq('id', task.id)

    if (error) setTasks(previous)

    return { error }
  }

  async function toggleTask(task) {
    const nextCompleted = !task.completed
    const completedAt = nextCompleted ? new Date().toISOString() : null

    // Optimista.
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, completed: nextCompleted, completed_at: completedAt } : t,
      ),
    )

    const { error } = await supabase
      .from('tasks')
      .update({ completed: nextCompleted, completed_at: completedAt })
      .eq('id', task.id)

    if (error) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, completed: task.completed, completed_at: task.completed_at }
            : t,
        ),
      )
    }

    return { error }
  }

  async function deleteTask(task) {
    const previous = tasks
    setTasks((prev) => prev.filter((t) => t.id !== task.id))

    const { error } = await supabase.from('tasks').delete().eq('id', task.id)

    if (error) setTasks(previous)

    return { error }
  }

  return {
    tasks,
    tasksByDate,
    loading,
    error,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    refresh: load,
  }
}
