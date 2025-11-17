-- Migration: Add date-filtered leaderboard function
-- This allows filtering the leaderboard by date ranges

-- Create function to get leaderboard with date filtering
create or replace function public.get_leaderboard_filtered(
  start_date date default null,
  end_date date default null,
  limit_count integer default 10
)
returns table (
  id uuid,
  user_id uuid,
  name text,
  personal_target integer,
  completed_count bigint,
  completion_percentage numeric
) language sql stable security definer set search_path = public as $$
  select 
    p.id,
    p.user_id,
    coalesce(p.first_name || ' ' || p.last_name, p.display_name, split_part(p.email, '@', 1)) as name,
    p.personal_target,
    count(pr.id) filter (
      where pr.status = 'approved' 
      and pr.deleted_at is null
      and (start_date is null or pr.promise_date >= start_date)
      and (end_date is null or pr.promise_date <= end_date)
    ) as completed_count,
    round(
      (count(pr.id) filter (
        where pr.status = 'approved' 
        and pr.deleted_at is null
        and (start_date is null or pr.promise_date >= start_date)
        and (end_date is null or pr.promise_date <= end_date)
      )::numeric / 
      nullif(p.personal_target, 0)::numeric) * 100, 
      1
    ) as completion_percentage
  from public.partners p
  left join public.protections pr on pr.partner_user_id = p.user_id
  group by p.id, p.user_id, p.first_name, p.last_name, p.display_name, p.email, p.personal_target
  having count(pr.id) filter (
    where pr.status = 'approved' 
    and pr.deleted_at is null
    and (start_date is null or pr.promise_date >= start_date)
    and (end_date is null or pr.promise_date <= end_date)
  ) > 0
  order by completed_count desc, completion_percentage desc
  limit limit_count;
$$;

-- Grant execute permission to authenticated users
grant execute on function public.get_leaderboard_filtered(date, date, integer) to authenticated;

comment on function public.get_leaderboard_filtered is 'Get leaderboard with optional date range filtering. Pass null for both dates to get all-time leaderboard.';

