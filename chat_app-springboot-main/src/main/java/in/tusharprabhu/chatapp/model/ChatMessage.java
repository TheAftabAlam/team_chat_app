package in.tusharprabhu.chatapp.model;

import lombok.*;

import java.nio.file.FileStore;
import java.sql.Timestamp;

/**
 * Represents a chat message in the chat application.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessage {
    private String content;
    private String sender;
    private MessageType type;
    private Timestamp timestamp;

    public enum MessageType {
        CHAT, LEAVE, JOIN
    }

}
