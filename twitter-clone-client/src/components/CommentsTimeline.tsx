import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineOppositeContent from '@mui/lab/TimelineOppositeContent';
import Typography from '@mui/material/Typography';
import { Avatar, Link } from '@mui/material';
import { Comment } from './TweetDetailPage';
import { convertFromUnixTimeDateTime } from '../utils/helper';
import { useAuth } from '../hooks/useAuth';

export default function CommentsTimeline(props: { comments: Comment[] }) {
    const userAuth = useAuth();
    return (
        <Timeline position="alternate">
            {props.comments.map((comment, idx) => (
                <TimelineItem key={idx}>
                    <TimelineOppositeContent
                        sx={{ m: 'auto 0' }}
                        align="right"
                        variant="body2"
                        color="text.secondary"
                    >
                        {convertFromUnixTimeDateTime(comment.createdAt)}
                    </TimelineOppositeContent>
                    <TimelineSeparator>
                        <TimelineConnector />
                            <Link 
                            href={
                                userAuth.userData!.id === comment.posterPK ? 
                                "/dashboard/profile/me" :
                                `/dashboard/profile/${comment.posterSK}`
                             }>
                            <Avatar src={comment.profileImage} sx={{
                                width: "60px",
                                height: "60px",
                            }}/>
                            </Link>
                        <TimelineConnector />
                    </TimelineSeparator>
                    <TimelineContent sx={{ py: '12px', px: 2 }}>
                        <Typography variant="h6" component="span">
                            {comment.posterName}
                        </Typography>
                        <Typography sx={{wordBreak: "break-word"}}>{comment.content}</Typography>
                    </TimelineContent>
                </TimelineItem>
            ))}
        </Timeline>
    );
}
