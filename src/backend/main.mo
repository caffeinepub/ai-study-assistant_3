import Time "mo:core/Time";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

actor {
  type Message = {
    sender : Text;
    content : Text;
    imageData : ?Text;
    timestamp : Time.Time;
    isAI : Bool;
  };

  module Message {
    public func compare(message1 : Message, message2 : Message) : Order.Order {
      Int.compare(message1.timestamp, message2.timestamp);
    };
  };

  type ChatSession = {
    id : Text;
    messages : [Message];
    created : Time.Time;
  };

  type StudySession = {
    user : Principal;
    startTime : Time.Time;
    endTime : Time.Time;
    durationMinutes : Nat;
    completed : Bool;
  };

  let chatSessions = Map.empty<Text, ChatSession>();
  let studySessions = Map.empty<Principal, [StudySession]>();

  public shared ({ caller }) func createChatSession(sessionId : Text) : async () {
    if (chatSessions.containsKey(sessionId)) { Runtime.trap("Session already exists") };

    let newSession : ChatSession = {
      id = sessionId;
      messages = [];
      created = Time.now();
    };

    chatSessions.add(sessionId, newSession);
  };

  public shared ({ caller }) func addMessage(sessionId : Text, sender : Text, content : Text, imageData : ?Text, isAI : Bool) : async () {
    let session = switch (chatSessions.get(sessionId)) {
      case (null) {
        Runtime.trap("Chat session does not exist");
      };
      case (?s) { s };
    };

    let newMessage : Message = {
      sender;
      content;
      imageData;
      isAI;
      timestamp = Time.now();
    };

    let updatedMessages = session.messages.concat([newMessage]);
    let updatedSession = {
      session with messages = updatedMessages;
    };

    chatSessions.add(sessionId, updatedSession);
  };

  public query ({ caller }) func getChatHistory(sessionId : Text) : async [Message] {
    let session = switch (chatSessions.get(sessionId)) {
      case (null) {
        Runtime.trap("Chat session does not exist");
      };
      case (?s) { s };
    };

    session.messages.sort();
  };

  public shared ({ caller }) func saveStudySession(startTime : Time.Time, endTime : Time.Time, durationMinutes : Nat, completed : Bool) : async () {
    let newSession : StudySession = {
      user = caller;
      startTime;
      endTime;
      durationMinutes;
      completed;
    };

    var userSessions = switch (studySessions.get(caller)) {
      case (null) {
        [];
      };
      case (?sessions) { sessions };
    };

    userSessions := userSessions.concat([newSession]);
    studySessions.add(caller, userSessions);
  };

  public query ({ caller }) func getStudyHistory(user : Principal) : async [StudySession] {
    let sessions = switch (studySessions.get(user)) {
      case (null) {
        Runtime.trap("No study sessions found for user");
      };
      case (?sessions) { sessions };
    };
    sessions;
  };
};
